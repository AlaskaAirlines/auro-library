/**
 * Promote deprecation prose on events and slots into the CEM `deprecated` field.
 *
 * The analyzer (v0.11.0) emits a `deprecated` field for attributes and members
 * from an explicit `@deprecated` JSDoc tag, but it does NOT do so for events and
 * slots declared as inline class-level `@event` / `@slot` tags — so an event or
 * slot whose description reads as deprecated ("(Deprecated) …", "**DEPRECATED** …")
 * carries no machine-readable flag, and editor tooling cannot strike it through.
 *
 * This post-processing plugin scans each declaration's `events` and `slots`, and
 * where the description contains a deprecation marker, sets `deprecated` to the
 * guidance text following the marker (e.g. "Use `x` instead.") or `true` when the
 * prose offers no replacement guidance. Attributes and members are intentionally
 * left untouched — the analyzer already flags those correctly.
 *
 * Shared build utility for the Auro Design System. Import it into a component
 * library's `custom-elements-manifest.config.mjs`:
 *
 * ```js
 * import { deprecatedProseToFieldPlugin } from '@aurodesignsystem/auro-library/scripts/build/deprecatedProseToFieldPlugin.mjs';
 *
 * export default {
 *   // …
 *   plugins: [deprecatedProseToFieldPlugin()]
 * };
 * ```
 *
 * @returns {{ name: string, packageLinkPhase: (context: { customElementsManifest: object }) => void }}
 *   A Custom Elements Manifest analyzer plugin.
 */
export function deprecatedProseToFieldPlugin() {
  const MARKER = /\*\*deprecated\*\*|\(deprecated\)|(?:^|\s)deprecated\b/i;
  const GUIDANCE =
    /(?:\*\*deprecated\*\*|\(deprecated\)|(?:^|\s)deprecated\b)\s*[-:–—]\s*(.+)/is;

  const promote = (entries) => {
    if (!Array.isArray(entries)) {
      return;
    }
    for (const entry of entries) {
      if (
        entry.deprecated !== undefined ||
        typeof entry.description !== "string"
      ) {
        continue;
      }
      if (!MARKER.test(entry.description)) {
        continue;
      }
      const guidance = entry.description.match(GUIDANCE);
      entry.deprecated = guidance && guidance[1] ? guidance[1].trim() : true;
    }
  };

  return {
    name: "deprecated-prose-to-field",
    packageLinkPhase({ customElementsManifest }) {
      for (const mod of customElementsManifest.modules ?? []) {
        for (const declaration of mod.declarations ?? []) {
          promote(declaration.events);
          promote(declaration.slots);
        }
      }
    },
  };
}
