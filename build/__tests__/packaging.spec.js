// auro-library is a runtime dependency of nearly every Auro component, so
// anything listed in `dependencies` is installed into every downstream
// project. The bundle in `dist/` exists so the doc-generation tooling can stay
// in `devDependencies`; these tests fail if that arrangement is undone, or if
// the published tarball stops matching what the shims expect to find.

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { allShims, distPathFor, ENTRY_POINTS } from "../entryPoints.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

// Bundled into dist/ rather than shipped. Each one was, or would otherwise be,
// a runtime dependency of every consumer.
const BUNDLED_TOOLING = ["handlebars", "markdown-magic", "glob"];

// Replaced outright rather than bundled: `scripts/utils/ansiColors.mjs` covers
// the one `hex(color)(text)` call this package made. chalk was only ever
// resolved by accident from a consumer's tree, so it belongs in neither
// dependency list.
const REPLACED_TOOLING = ["chalk"];

describe("published package", () => {
  /** @type {Record<string, unknown>} */
  let packageJson;

  beforeAll(async () => {
    packageJson = JSON.parse(
      await readFile(path.join(repoRoot, "package.json"), "utf8"),
    );
  });

  it("keeps bundled tooling out of runtime dependencies", () => {
    const leaked = BUNDLED_TOOLING.filter(
      (name) => name in (packageJson.dependencies ?? {}),
    );

    expect(leaked).toEqual([]);
  });

  it("still declares the bundled tooling as a devDependency", () => {
    // Not redundant with the check above: dropping these entirely would break
    // `build:bundles` at publish time rather than at install time.
    const undeclared = BUNDLED_TOOLING.filter(
      (name) => !(name in (packageJson.devDependencies ?? {})),
    );

    expect(undeclared).toEqual([]);
  });

  it("does not reintroduce the tooling that was replaced outright", () => {
    const reintroduced = REPLACED_TOOLING.filter(
      (name) =>
        name in (packageJson.dependencies ?? {}) ||
        name in (packageJson.devDependencies ?? {}),
    );

    expect(reintroduced).toEqual([]);
  });
});

describe("package tarball", () => {
  /** @type {string[]} */
  let files = [];

  beforeAll(() => {
    // `--ignore-scripts` skips the `prepack` rebuild: this asserts what npm
    // would include, not that the build runs twice.
    const stdout = execFileSync(
      "npm",
      ["pack", "--dry-run", "--json", "--ignore-scripts"],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );

    files = JSON.parse(stdout)[0].files.map((entry) => entry.path);
  }, 60000);

  it("publishes the compiled output for every entry point", () => {
    // dist/ is gitignored, so this also pins the fact that the root
    // .npmignore -- not .gitignore -- decides the tarball's contents.
    const expected = ENTRY_POINTS.map(distPathFor);

    expect(files).toEqual(expect.arrayContaining(expected));
  });

  it("publishes the shared chunks the entry points import", () => {
    const chunks = files.filter((file) => file.startsWith("dist/_chunks/"));

    expect(chunks.length).toBeGreaterThan(0);
  });

  it("publishes the shims consumers import by path", () => {
    const expected = allShims().map((shim) => shim.file);

    expect(files).toEqual(expect.arrayContaining(expected));
  });

  it("excludes the bundle sources and build tooling", () => {
    // Both .npmignore patterns are root-anchored on purpose: a bare `build/`
    // would also match scripts/build/ and dist/build/. This fails in either
    // direction -- sources shipped, or the anchoring lost.
    const shipped = files.filter(
      (file) => file.startsWith("src/") || file.startsWith("build/"),
    );

    expect(shipped).toEqual([]);
  });

  it("excludes test files", () => {
    const tests = files.filter(
      (file) => file.includes("__tests__/") || file.endsWith(".spec.js"),
    );

    expect(tests).toEqual([]);
  });
});
