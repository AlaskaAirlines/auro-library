// The source files that `bundleDocsScripts.mjs` pre-compiles into `dist/`, and
// the shims that point the published paths at that output.
//
// This list lives in its own module so the build and its tests read the same
// one. The shims in `scripts/` and `bin/` point at `dist/` paths that only
// exist because a matching entry appears here; if the two drift, nothing in
// this repo breaks -- the failure surfaces in a consumer's build after the
// package is already published. The shims are generated from this list rather
// than hand-written, so adding an entry point cannot leave one behind.
//
// The generated shims are committed, unlike `dist/`. They are the paths the
// `bin` field and the README tell consumers to run, so leaving them untracked
// hid every documented entry point from anyone reading the repo. Drift is
// caught by a test asserting each one matches what the build emits, rather
// than by keeping them out of git.

import path from "node:path";

/**
 * Prefix on every generated shim, and the marker the build matches to tell a
 * shim from the hand-written files it sits beside. The build deletes every
 * file starting with it before regenerating, so an entry point dropped from
 * the list takes its shim with it.
 *
 * Kept to the leading sentence rather than the whole header so the wording
 * after it can change without orphaning the shims already on disk -- a
 * rebuild would no longer recognize them, and would leave them behind next to
 * the ones it writes.
 */
export const SHIM_MARKER = "// Shim for the pre-compiled build.";

/**
 * @typedef {Object} Entry
 * @property {string} src - Repo-relative path, rooted at `src/`.
 * @property {"executable"|"module"} kind - `executable` entries are run by
 * path (`node …/generateDocs.mjs`) and export nothing, so their shim imports
 * for side effects only. `module` entries are imported for their named
 * exports, so their shim forwards them.
 */

/**
 * Every one of these is an entry point rather than only the leaves, because
 * consumers import several directly and any one may be the only entry a given
 * consumer loads.
 * @type {Entry[]}
 */
export const ENTRIES = [
  { src: "src/bin/generateDocs.mjs", kind: "executable" },
  { src: "src/bin/generateDocs_index.mjs", kind: "executable" },
  { src: "src/build/generateDocs.mjs", kind: "executable" },
  { src: "src/build/generateReadme.mjs", kind: "executable" },
  { src: "src/build/generateWcaComponent.mjs", kind: "executable" },
  { src: "src/build/syncGithubFiles.mjs", kind: "executable" },
  { src: "src/build/processors/defaultDocsProcessor.mjs", kind: "module" },
  { src: "src/build/processors/defaultDotGithubSync.mjs", kind: "module" },
  { src: "src/utils/sharedFileProcessorUtils.mjs", kind: "module" },
  { src: "src/utils/auroTemplateFiller.mjs", kind: "module" },
];

/**
 * Repo-relative source paths, in the shape esbuild's `entryPoints` wants.
 * @type {string[]}
 */
export const ENTRY_POINTS = ENTRIES.map((entry) => entry.src);

/**
 * Directories holding the generated shims, i.e. the paths consumers have been
 * importing since before the bundle existed.
 * @type {string[]}
 */
export const SHIM_ROOTS = ["scripts", "bin"];

/**
 * The `dist/` output path for a `src/`-rooted entry point.
 * @param {string} src - Repo-relative path beginning with `src/`.
 * @returns {string} Repo-relative path beginning with `dist/`.
 */
export function distPathFor(src) {
  return src.replace(/^src\//u, "dist/");
}

/**
 * Where an entry point's shim goes. `src/bin/` published at the repo root
 * because of the `bin` field in package.json; everything else published under
 * `scripts/`.
 * @param {string} src - Repo-relative path beginning with `src/`.
 * @returns {string} Repo-relative path of the shim.
 */
export function shimPathFor(src) {
  const withoutSrc = src.replace(/^src\//u, "");

  return withoutSrc.startsWith("bin/")
    ? withoutSrc
    : path.posix.join("scripts", withoutSrc);
}

/**
 * The shim for one entry point: where it lives, and what it contains.
 * @param {Entry} entry - An element of {@link ENTRIES}.
 * @returns {{file: string, specifier: string, distPath: string, source: string}}
 * Repo-relative paths, plus the shim's specifier and full file contents.
 */
export function shimFor(entry) {
  const file = shimPathFor(entry.src);
  const distPath = distPathFor(entry.src);

  // Relative to the shim's own directory, so the specifier resolves the same
  // way from the repo and from inside a consumer's node_modules.
  const specifier = path.posix.relative(path.posix.dirname(file), distPath);

  const body =
    entry.kind === "module"
      ? `export * from "${specifier}";`
      : `import "${specifier}";`;

  // The shim is committed and shares its filename with the `src/` file it was
  // built from, so a file search offers both. The header says which one this
  // is and where the edit belongs, because the byte-for-byte test in
  // distBundle.spec.js is otherwise the only thing that catches an edit here
  // -- and it reports drift, not what to do about it.
  const header = [
    `${SHIM_MARKER} Do not edit.`,
    `// Generated by build/bundleDocsScripts.mjs from ${entry.src}.`,
    "// Edit that file, then run `npm run build:bundles`.",
  ].join("\n");

  return {
    file,
    specifier,
    distPath,
    source: `${header}\n${body}\n`,
  };
}

/**
 * Every shim the build emits.
 * @returns {ReturnType<typeof shimFor>[]} One descriptor per entry point.
 */
export function allShims() {
  return ENTRIES.map(shimFor);
}
