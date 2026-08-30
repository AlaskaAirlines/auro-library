import { describe, expect, it } from "vitest";
import { deprecatedProseToFieldPlugin } from "./deprecatedProseToFieldPlugin.mjs";

/**
 * Wrap one or more `entries` (events or slots) in a minimal Custom Elements
 * Manifest shape, run the plugin's `packageLinkPhase` over it, and return the
 * mutated entries so assertions can read their `deprecated` field.
 */
const run = (kind, entries) => {
  const manifest = {
    modules: [
      {
        declarations: [{ [kind]: entries }],
      },
    ],
  };
  deprecatedProseToFieldPlugin().packageLinkPhase({
    customElementsManifest: manifest,
  });
  return manifest.modules[0].declarations[0][kind];
};

describe("deprecatedProseToFieldPlugin", () => {
  it("has the expected plugin name", () => {
    expect(deprecatedProseToFieldPlugin().name).toBe(
      "deprecated-prose-to-field",
    );
  });

  describe("marker + guidance -> string message", () => {
    it('extracts guidance following a "(deprecated) -" marker', () => {
      const [entry] = run("events", [
        {
          name: "change",
          description: "(Deprecated) - Use the `input` event instead.",
        },
      ]);
      expect(entry.deprecated).toBe("Use the `input` event instead.");
    });

    it("extracts guidance for each supported separator (- : – —)", () => {
      const separators = ["-", ":", "–", "—"];
      separators.forEach((sep) => {
        const [entry] = run("events", [
          {
            name: "change",
            description: `**DEPRECATED** ${sep} Use \`input\` instead.`,
          },
        ]);
        expect(entry.deprecated).toBe("Use `input` instead.");
      });
    });

    it("trims surrounding whitespace from the guidance text", () => {
      const [entry] = run("slots", [
        {
          name: "legacy",
          description: "deprecated:   Use the `default` slot instead.   ",
        },
      ]);
      expect(entry.deprecated).toBe("Use the `default` slot instead.");
    });
  });

  describe("marker with no guidance -> boolean true", () => {
    it('flags a "**DEPRECATED**" prose with no replacement guidance', () => {
      const [entry] = run("slots", [
        { name: "legacy", description: "**DEPRECATED** legacy slot" },
      ]);
      expect(entry.deprecated).toBe(true);
    });

    it('flags a bare "(deprecated)" marker as true', () => {
      const [entry] = run("events", [
        { name: "change", description: "(deprecated)" },
      ]);
      expect(entry.deprecated).toBe(true);
    });
  });

  describe("non-deprecated entries are untouched", () => {
    it("does not add a deprecated field when no marker is present", () => {
      const [entry] = run("events", [
        { name: "input", description: "Fires when the value changes." },
      ]);
      expect(entry).not.toHaveProperty("deprecated");
    });

    it('does not match unrelated words containing "deprecated" as a substring', () => {
      const [entry] = run("events", [
        { name: "input", description: "This is undeprecated behavior." },
      ]);
      expect(entry).not.toHaveProperty("deprecated");
    });
  });

  describe("pre-existing deprecated values are preserved", () => {
    it("does not overwrite an already-set string message", () => {
      const [entry] = run("events", [
        {
          name: "change",
          description: "(Deprecated) - Use `input`.",
          deprecated: "existing guidance",
        },
      ]);
      expect(entry.deprecated).toBe("existing guidance");
    });

    it("does not overwrite an already-set boolean false", () => {
      const [entry] = run("events", [
        {
          name: "change",
          description: "(Deprecated) - Use `input`.",
          deprecated: false,
        },
      ]);
      expect(entry.deprecated).toBe(false);
    });
  });

  describe("malformed / missing descriptions are skipped safely", () => {
    it("skips entries whose description is not a string", () => {
      const [noDesc, objDesc] = run("slots", [
        { name: "a" },
        { name: "b", description: { text: "deprecated" } },
      ]);
      expect(noDesc).not.toHaveProperty("deprecated");
      expect(objDesc).not.toHaveProperty("deprecated");
    });
  });

  describe("applies to both events and slots, leaves other fields alone", () => {
    it("promotes both events and slots on the same declaration", () => {
      const manifest = {
        modules: [
          {
            declarations: [
              {
                events: [
                  { name: "change", description: "deprecated - Use `input`." },
                ],
                slots: [
                  { name: "legacy", description: "(Deprecated) legacy slot" },
                ],
                attributes: [
                  {
                    name: "value",
                    description: "deprecated - do not touch me",
                  },
                ],
                members: [
                  { name: "reset", description: "(deprecated) leave me alone" },
                ],
              },
            ],
          },
        ],
      };
      deprecatedProseToFieldPlugin().packageLinkPhase({
        customElementsManifest: manifest,
      });
      const [decl] = manifest.modules[0].declarations;
      expect(decl.events[0].deprecated).toBe("Use `input`.");
      expect(decl.slots[0].deprecated).toBe(true);
      expect(decl.attributes[0]).not.toHaveProperty("deprecated");
      expect(decl.members[0]).not.toHaveProperty("deprecated");
    });
  });

  describe("does not throw on empty or absent manifest structures", () => {
    it("handles a manifest with no modules", () => {
      expect(() =>
        deprecatedProseToFieldPlugin().packageLinkPhase({
          customElementsManifest: {},
        }),
      ).not.toThrow();
    });

    it("handles declarations without events or slots arrays", () => {
      const manifest = { modules: [{ declarations: [{}] }] };
      expect(() =>
        deprecatedProseToFieldPlugin().packageLinkPhase({
          customElementsManifest: manifest,
        }),
      ).not.toThrow();
    });
  });
});
