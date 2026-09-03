// Pre-compiles the build-time scripts into `dist/`.
//
// `handlebars`, `markdown-magic` and `glob` are dev-time tooling, but
// auro-library is a runtime dependency of nearly every Auro component, so
// declaring them as runtime dependencies installed them into every downstream
// project. Bundling these entry points lets all three stay in devDependencies
// without breaking consumers that run doc generation or WCA prep.
//
// The files at the original published paths (scripts/**, bin/**) are thin
// shims that re-export from `dist/`, so existing import specifiers and
// direct-path invocations keep working unchanged. They are generated here from
// the same list that drives esbuild rather than hand-written, so adding an
// entry point is a one-line change.
//
// Unlike `dist/`, the shims are committed -- they are the paths `bin` and the
// README point consumers at, so the repo should show them. Regenerating them
// on every build means a stale one shows up as a diff, and `distBundle.spec.js`
// fails if a commit forgets it.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import {
  allShims,
  ENTRY_POINTS,
  SHIM_MARKER,
  SHIM_ROOTS,
} from "./entryPoints.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const fromRoot = (...segments) => path.join(repoRoot, ...segments);

// Every source file that transitively reaches `handlebars`, `markdown-magic`
// or `glob`. See `entryPoints.mjs` for why the list is shared.
const absoluteEntryPoints = ENTRY_POINTS.map((entry) => fromRoot(entry));

// esbuild's CommonJS interop emits a `__require` shim that defers to an
// in-scope `require` when one exists. Without this banner, bundled CJS
// dependencies fail at load with `Dynamic require of "fs" is not supported`.
const CREATE_REQUIRE_BANNER =
  "import{createRequire as __auroCreateRequire}from'node:module';" +
  "const require=__auroCreateRequire(import.meta.url);";

// Content-hashed chunk names mean a rebuild leaves the previous build's chunks
// behind rather than overwriting them. Nothing imports the orphans, but they
// are not gitignored out of the tarball, so a stale `dist/` ships them --
// roughly doubling the published size after a couple of local rebuilds.
rmSync(fromRoot("dist"), { recursive: true, force: true });

await esbuild.build({
  entryPoints: absoluteEntryPoints,
  bundle: true,

  // Required, not an optimization: sharedFileProcessorUtils exports a
  // `templateFiller` singleton whose `values` are populated by one module and
  // read by another (see generateReadmeUrl). Splitting keeps that state in one
  // shared chunk so every entry point observes the same instance.
  splitting: true,

  platform: "node",
  format: "esm",
  target: "node20",

  outbase: fromRoot("src"),
  outdir: fromRoot("dist"),

  // The package has no `"type": "module"`, so a `.js` output would be treated
  // as CommonJS and fail to parse as ESM.
  outExtension: { ".js": ".mjs" },
  chunkNames: "_chunks/[name]-[hash]",

  alias: {
    "sync-request": fromRoot("build/shims/syncRequest.cjs"),
  },

  banner: { js: CREATE_REQUIRE_BANNER },

  logLevel: "info",
});

/**
 * Deletes previously generated shims. Matching on {@link SHIM_MARKER} rather
 * than on the current entry list is what removes the shim for an entry point
 * that has since been dropped -- it surfaces as a staged deletion rather than
 * as a file nothing imports -- and what keeps hand-written files under
 * `scripts/` -- which outnumber the shims -- from being touched.
 * @param {string} dir - Absolute directory to walk.
 * @returns {void}
 */
function pruneGeneratedShims(dir) {
  // Tolerated rather than expected: the shims are committed, so both roots
  // exist in a fresh clone. A tree with one deleted still builds.
  if (!existsSync(dir)) {
    return;
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      pruneGeneratedShims(full);
    } else if (
      entry.name.endsWith(".mjs") &&
      readFileSync(full, "utf8").startsWith(SHIM_MARKER)
    ) {
      rmSync(full);
    }
  }
}

for (const root of SHIM_ROOTS) {
  pruneGeneratedShims(fromRoot(root));
}

for (const shim of allShims()) {
  const destination = fromRoot(shim.file);

  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, shim.source);
}
