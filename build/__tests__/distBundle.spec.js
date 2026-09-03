// Guards the pre-compiled build introduced alongside `build/bundleDocsScripts.mjs`.
//
// The unit tests for the doc-generation logic import `src/` directly, so they
// pass whether or not `dist/` is correct. Everything below is the opposite:
// it only looks at the emitted bundle and the shims that point at it, because
// a break there is invisible in this repo and only fails in a consumer.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { isBuiltin } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import { beforeAll, describe, expect, it } from "vitest";
import {
  allShims,
  distPathFor,
  ENTRIES,
  ENTRY_POINTS,
  SHIM_MARKER,
  SHIM_ROOTS,
  shimFor,
} from "../entryPoints.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const fromRoot = (...segments) => path.join(repoRoot, ...segments);
const relToRoot = (absolute) => path.relative(repoRoot, absolute);

const CREATE_REQUIRE_BANNER =
  "import{createRequire as __auroCreateRequire}from'node:module';";

/**
 * Every relative ESM specifier in a bundled file. Restricted to `.mjs` so the
 * scan cannot follow a match inside a bundled string literal or comment.
 * @param {string} source - Contents of an emitted file.
 * @returns {string[]} The matched specifiers.
 */
function relativeSpecifiers(source) {
  const matches = source.matchAll(/["'](\.{1,2}\/[^"']*\.mjs)["']/gu);
  return [...matches].map((match) => match[1]);
}

/**
 * Bare specifiers reached by `require()` in the emitted output.
 *
 * esbuild's metafile does not report these: the output is ESM, so a
 * `__require("fs")` left by CommonJS interop is an ordinary function call
 * rather than an import it tracks. Matching the call shape directly is
 * narrow enough to stay off string literals in bundled source -- unlike a
 * general `import`/`from` pattern, which matches prose like `from 'BigInt'`
 * inside a bundled error message.
 * @param {string} source - Contents of an emitted file.
 * @returns {string[]} The matched specifiers, relative ones included.
 */
function requireCallSpecifiers(source) {
  // Rejects `createRequire(` via the lookbehind, and accepts both `require(`
  // and the `__require(` esbuild emits.
  const matches = source.matchAll(
    /(?<![\w$])(?:__)?require\(\s*["']([^"']+)["']\s*\)/gu,
  );

  return [...matches].map((match) => match[1]);
}

/**
 * Every bare specifier the emitted files import, as `file -> specifier`.
 *
 * The ESM half runs the output back through esbuild purely as a parser, with
 * `external: ["*"]` so it reports specifiers instead of trying to follow
 * them, and `write: false` so nothing lands on disk. A real parse is what
 * keeps bundled string literals from registering as imports.
 * @param {string[]} files - Absolute paths of the emitted files.
 * @returns {Promise<{specifier: string, label: string}[]>} One entry per bare
 * import, with a `label` naming the file it came from.
 */
async function bareImports(files) {
  const parsed = await esbuild.build({
    entryPoints: files,
    bundle: true,
    metafile: true,
    write: false,
    platform: "node",
    format: "esm",
    external: ["*"],
    outbase: fromRoot("dist"),
    outdir: fromRoot("dist-parse-only-never-written"),
    logLevel: "silent",
  });

  const isBare = (specifier) =>
    !specifier.startsWith(".") && !path.isAbsolute(specifier);

  const found = Object.entries(parsed.metafile.inputs).flatMap(
    ([input, meta]) =>
      meta.imports
        .map((imported) => imported.path)
        .filter(isBare)
        .map((specifier) => ({ specifier, label: `${input} -> ${specifier}` })),
  );

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const source = await readFile(file, "utf8");

    found.push(
      ...requireCallSpecifiers(source)
        .filter(isBare)
        .map((specifier) => ({
          specifier,
          label: `${relToRoot(file)} -> require("${specifier}")`,
        })),
    );
  }

  return found;
}

/**
 * Walks a directory tree and returns every file path within it.
 * @param {string} dir - Absolute directory to walk.
 * @returns {Promise<string[]>} Absolute file paths.
 */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return nested.flat();
}

/**
 * Traverses the emitted module graph outward from the entry points.
 * @returns {Promise<{reachable: Set<string>, unresolved: string[]}>} Absolute
 * paths that some entry point transitively imports, plus any specifier that
 * pointed at a file which does not exist.
 */
async function traverseEmittedGraph() {
  const unresolved = [];
  const reachable = new Set();
  const queue = ENTRY_POINTS.map((entry) => fromRoot(distPathFor(entry)));

  while (queue.length > 0) {
    const current = queue.pop();
    if (reachable.has(current)) {
      continue;
    }
    reachable.add(current);

    // eslint-disable-next-line no-await-in-loop
    const source = await readFile(current, "utf8");

    for (const specifier of relativeSpecifiers(source)) {
      const resolved = path.resolve(path.dirname(current), specifier);

      if (existsSync(resolved)) {
        queue.push(resolved);
      } else {
        unresolved.push(`${relToRoot(current)} -> ${specifier}`);
      }
    }
  }

  return { reachable, unresolved };
}

describe("dist bundle", () => {
  let distFiles = [];
  /** @type {{reachable: Set<string>, unresolved: string[]}} */
  let graph;

  beforeAll(async () => {
    expect(
      existsSync(fromRoot("dist")),
      "dist/ is missing -- run `npm run build:bundles` before the suite",
    ).toBe(true);

    distFiles = await walk(fromRoot("dist"));
    graph = await traverseEmittedGraph();
  });

  it("emits an output file for every entry point", () => {
    const missing = ENTRY_POINTS.map(distPathFor).filter(
      (output) => !existsSync(fromRoot(output)),
    );

    expect(missing).toEqual([]);
  });

  it("imports nothing outside the Node builtins", async () => {
    // The headline requirement of AB#1616087: handlebars, markdown-magic and
    // glob are devDependencies now, so anything the bundle still reaches for
    // by name is gone in a consumer's install. That fails as
    // ERR_MODULE_NOT_FOUND in their build, and every other test in this file
    // passes while it is true -- the graph walk below only follows relative
    // specifiers, so a surviving `import "handlebars"` is invisible to it.
    //
    // Node builtins are the one safe category, and they are also the reason
    // this cannot just assert on the three package names: the check should
    // fail for any external, including one added later.
    const external = (await bareImports(distFiles)).filter(
      (entry) => !isBuiltin(entry.specifier),
    );

    expect(external.map((entry) => entry.label)).toEqual([]);
  });

  it("resolves every relative import in the emitted graph", () => {
    // A chunk renamed by a rebuild, or an entry point dropped from the list,
    // shows up here as an unresolvable specifier rather than as a consumer's
    // ERR_MODULE_NOT_FOUND.
    expect(graph.unresolved).toEqual([]);
  });

  it("leaves no orphaned files in dist/", () => {
    // The reverse of the check above, and the reason bundleDocsScripts.mjs
    // clears dist/ before building. Chunk names are content-hashed, so a
    // rebuild writes new chunks alongside the previous build's rather than
    // overwriting them. Nothing imports the leftovers, so walking outward from
    // the entry points cannot see them -- but .npmignore does not exclude
    // them, so they ship, roughly doubling the tarball after a couple of local
    // rebuilds. Dropping the rmSync leaves every other test in this file
    // passing.
    const orphaned = distFiles
      .filter((file) => !graph.reachable.has(file))
      .map(relToRoot);

    expect(orphaned).toEqual([]);
  });

  it("prefixes every emitted file with the createRequire banner", async () => {
    // Without the banner, esbuild's CommonJS interop fails at load with
    // `Dynamic require of "fs" is not supported`.
    const missingBanner = [];

    for (const file of distFiles) {
      // eslint-disable-next-line no-await-in-loop
      const source = await readFile(file, "utf8");

      if (!source.startsWith(CREATE_REQUIRE_BANNER)) {
        missingBanner.push(relToRoot(file));
      }
    }

    expect(missingBanner).toEqual([]);
  });

  it("keeps sync-rpc out of the bundle", async () => {
    // `sync-request` pulls in `sync-rpc`, which calls
    // `require.resolve('./worker')` at load time and throws inside a bundle.
    // The alias in bundleDocsScripts.mjs replaces it; this fails if that
    // alias is dropped.
    const contaminated = [];

    for (const file of distFiles) {
      // eslint-disable-next-line no-await-in-loop
      const source = await readFile(file, "utf8");

      if (source.includes("sync-rpc")) {
        contaminated.push(relToRoot(file));
      }
    }

    expect(contaminated).toEqual([]);
  });

  it("shares one AuroTemplateFiller instance across entry points", async () => {
    // `splitting: true` is load-bearing, not an optimization: the exported
    // `templateFiller` singleton is populated by one module and read by
    // another. Without splitting, each entry point gets its own copy and the
    // second read sees empty values.
    const instantiating = [];

    for (const file of distFiles) {
      // eslint-disable-next-line no-await-in-loop
      const source = await readFile(file, "utf8");

      if (source.includes("new AuroTemplateFiller()")) {
        instantiating.push(relToRoot(file));
      }
    }

    expect(instantiating).toHaveLength(1);
  });
});

describe("dist shims", () => {
  // Found by walking, not by reading the entry list, so a shim left behind by
  // a deleted entry point shows up as an extra rather than going unnoticed.
  /** @type {Map<string, string>} */
  let onDisk = new Map();

  beforeAll(async () => {
    const candidates = (
      await Promise.all(SHIM_ROOTS.map((root) => walk(fromRoot(root))))
    )
      .flat()
      .filter((file) => file.endsWith(".mjs"));

    const found = await Promise.all(
      candidates.map(async (file) => {
        const source = await readFile(file, "utf8");

        // The same marker the build prunes on, and the only thing separating a
        // shim from the hand-written scripts it sits beside.
        return source.startsWith(SHIM_MARKER)
          ? [relToRoot(file), source]
          : null;
      }),
    );

    onDisk = new Map(found.filter(Boolean));
  });

  it("has one shim per entry point and no others", () => {
    const expected = allShims()
      .map((shim) => shim.file)
      .sort();

    expect([...onDisk.keys()].sort()).toEqual(expected);
  });

  it("matches byte-for-byte what the build generates", () => {
    // The shims are committed, so this is what keeps them honest: a stale one
    // left by a branch switch, an edit to the generated file instead of its
    // `src/` original, or a regenerated shim left out of a commit.
    const drifted = allShims()
      .filter((shim) => onDisk.get(shim.file) !== shim.source)
      .map((shim) => shim.file);

    expect(
      drifted,
      "run `npm run build:bundles` to regenerate the shims",
    ).toEqual([]);
  });

  it("tracks every shim in git", () => {
    // Unlike dist/, the shims are committed -- they are the paths the `bin`
    // field and the README send consumers to, so the repo should show them.
    // The failure this catches is adding an entry point, building, and
    // committing without the new shim: everything here passes locally because
    // the build just wrote it, and the published package is missing the path
    // the consumer imports.
    const files = allShims().map((shim) => shim.file);

    const { status, stdout } = spawnSync(
      "git",
      ["ls-files", "--cached", "--", ...files],
      { cwd: repoRoot, encoding: "utf8" },
    );

    expect(status, "git ls-files failed").toBe(0);

    const tracked = new Set(stdout.split("\n").filter(Boolean));
    const untracked = files.filter((file) => !tracked.has(file));

    expect(untracked, "git add the generated shims").toEqual([]);
  });

  it("points every shim at a file the build actually emits", () => {
    const dangling = allShims().filter(
      (shim) => !existsSync(fromRoot(shim.distPath)),
    );

    expect(dangling.map((shim) => `${shim.file} -> ${shim.specifier}`)).toEqual(
      [],
    );
  });

  it("re-exports the full public surface of each source module", async () => {
    // `export * from` silently drops a default export, and a shim that lost a
    // name would only fail at a consumer's import site. Restricted to `module`
    // entries: importing an `executable` one would run the script.
    const mismatches = [];

    for (const entry of ENTRIES.filter((item) => item.kind === "module")) {
      const shim = shimFor(entry);

      const [viaShim, viaSource] = await Promise.all([
        import(pathToFileURL(fromRoot(shim.file)).href),
        import(pathToFileURL(fromRoot(entry.src)).href),
      ]);

      const shimNames = Object.keys(viaShim).sort();
      const sourceNames = Object.keys(viaSource).sort();

      if (shimNames.join() !== sourceNames.join()) {
        mismatches.push({
          shim: shim.file,
          missing: sourceNames.filter((name) => !shimNames.includes(name)),
          extra: shimNames.filter((name) => !sourceNames.includes(name)),
        });
      }
    }

    expect(mismatches).toEqual([]);
  });
});
