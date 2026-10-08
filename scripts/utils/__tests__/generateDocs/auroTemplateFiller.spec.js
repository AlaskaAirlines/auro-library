import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
// Import the source, not the shim in scripts/, so the suite exercises the real
// implementation rather than requiring a dist/ build first.
import { AuroTemplateFiller } from "../../../../src/utils/auroTemplateFiller.mjs";

vi.mock("node:fs/promises");

const handlebarsTemplate =
  "{{Name}} Documentation | Installing {{ withAuroNamespace name}}";

const legacyTemplate = "[Name] Documentation | Installing [namespace]-[name]";

const nonStandardTemplate = "{{packageName}} test | {{namespace}}-{{name}}";

describe("AuroTemplateFiller", () => {
  /* @type {AuroTemplateFiller} */
  let filler = null;

  beforeEach(() => {
    filler = new AuroTemplateFiller();
  });

  it("should initialize values to null", () => {
    expect(filler.values).toBeNull();
  });

  it("should extract names from package.json", async () => {
    const mockPackageJson = JSON.stringify({
      name: "@aurodesignsystem/auro-button",
      version: "1.0.0",
      peerDependencies: {
        "@aurodesignsystem/design-tokens": "^2.0.0",
        "@aurodesignsystem/webcorestylesheets": "^3.0.0",
      },
    });

    fs.readFile.mockResolvedValue(mockPackageJson);

    await filler.extractNames();

    expect(filler.values).toEqual({
      npm: "@aurodesignsystem",
      namespace: "auro",
      namespaceCap: "Auro",
      name: "button",
      nameCap: "Button",
      version: "1.0.0",
      tokensVersion: "2.0.0",
      wcssVersion: "3.0.0",
    });
  });

  it("should default versions to empty strings when the Auro peer dependencies are absent", async () => {
    const mockPackageJson = JSON.stringify({
      name: "@aurodesignsystem/auro-button",
      version: "1.0.0",
      peerDependencies: {
        lit: "^3.0.0",
      },
    });

    fs.readFile.mockResolvedValue(mockPackageJson);

    await filler.extractNames();

    expect(filler.values.tokensVersion).toBe("");
    expect(filler.values.wcssVersion).toBe("");
  });

  it("should default versions to empty strings when peerDependencies is missing", async () => {
    const mockPackageJson = JSON.stringify({
      name: "@aurodesignsystem/auro-button",
      version: "1.0.0",
    });

    fs.readFile.mockResolvedValue(mockPackageJson);

    await filler.extractNames();

    expect(filler.values.tokensVersion).toBe("");
    expect(filler.values.wcssVersion).toBe("");
  });

  it("should replace handlebars template values correctly", () => {
    filler.values = {
      name: "button",
      nameCap: "Button",
      namespace: "auro",
      namespaceCap: "Auro",
      version: "1.0.0",
      tokensVersion: "2.0.0",
      wcssVersion: "3.0.0",
    };

    const result = filler.replaceTemplateValues(handlebarsTemplate);
    const packageNameResult = filler.replaceTemplateValues(nonStandardTemplate);

    expect(result.trim()).toBe("Button Documentation | Installing auro-button");
    expect(packageNameResult.trim()).toBe("auro-button test | auro-button");
  });

  it("should replace non-standard repository template values correctly", async () => {
    const mockPackageJson = JSON.stringify({
      name: "@aurodesignsystem/wc-generator",
      version: "1.0.0",
      peerDependencies: {
        "@aurodesignsystem/design-tokens": "^2.0.0",
        "@aurodesignsystem/webcorestylesheets": "^3.0.0",
      },
    });

    fs.readFile.mockResolvedValue(mockPackageJson);

    await filler.extractNames();

    const result = filler.replaceTemplateValues(nonStandardTemplate);

    expect(result.trim()).toBe("wc-generator test | wc-generator");
  });

  it("should throw an error when given a malformed package name", async () => {
    const mockPackageJson = JSON.stringify({
      name: "@aurodesignsystem/nunyabusiness",
      version: "1.0.0",
      peerDependencies: {
        "@aurodesignsystem/design-tokens": "^2.0.0",
        "@aurodesignsystem/webcorestylesheets": "^3.0.0",
      },
    });

    async function shouldThrowAnErrorFunction() {
      fs.readFile.mockResolvedValue(mockPackageJson);

      await filler.extractNames();

      filler.replaceTemplateValues(nonStandardTemplate);
    }

    await expect(() => shouldThrowAnErrorFunction()).rejects.toThrow(
      /No name can be derived/gu,
    );
  });

  it("should replace legacy template values correctly", () => {
    filler.values = {
      name: "button",
      nameCap: "Button",
      namespace: "auro",
      namespaceCap: "Auro",
      version: "1.0.0",
      tokensVersion: "2.0.0",
      wcssVersion: "3.0.0",
    };

    const result = filler.replaceTemplateValues(legacyTemplate);

    expect(result.trim()).toBe("Button Documentation | Installing auro-button");
  });

  it("should replace handlebars template values correctly with extra variables", () => {
    filler.values = {
      name: "button",
      nameCap: "Button",
      namespace: "auro",
      namespaceCap: "Auro",
      version: "1.0.0",
      tokensVersion: "2.0.0",
      wcssVersion: "3.0.0",
    };

    const extraVars = {
      formkitVersion: "1.5.0",
    };

    const result = filler.replaceTemplateValues(
      "{{formkitVersion}}",
      extraVars,
    );

    expect(result.trim()).toBe("1.5.0");
  });

  describe("line break cleanup", () => {
    beforeEach(() => {
      filler.values = {
        name: "button",
        nameCap: "Button",
        namespace: "auro",
        namespaceCap: "Auro",
        version: "1.0.0",
        tokensVersion: "2.0.0",
        wcssVersion: "3.0.0",
      };
    });

    it("should leave CSS `#id` rules in a fenced block unchanged", () => {
      const css =
        ".foo {\n  color: red;\n}\n#custom-tab-example::part(slider) {\n  color: blue;\n}";
      const template = `Intro\n\n\`\`\`css\n${css}\n\`\`\`\n`;

      const result = filler.replaceTemplateValues(template);

      expect(result).toContain(`\`\`\`css\n${css}\n\`\`\``);
      expect(result).not.toContain("\r");
    });

    it("should leave shell `#` comments and blank lines in a fenced block unchanged", () => {
      const sh = "# comment\necho hi\n\n\n# another\necho bye";
      const template = `\`\`\`sh\n${sh}\n\`\`\`\n`;

      const result = filler.replaceTemplateValues(template);

      expect(result).toBe(template);
    });

    it("should keep blank lines after a `>` inside a fenced block", () => {
      const html = "<div>\n\n\n</div>";
      const template = `\`\`\`html\n${html}\n\`\`\`\n`;

      const result = filler.replaceTemplateValues(template);

      expect(result).toBe(template);
    });

    it("should leave the body of a <pre> element unchanged", () => {
      const template =
        '<div>\n<pre class="language-css"><code class="language-css">a {}\n\n\n#b {}</code></pre>\n</div>\n';

      const result = filler.replaceTemplateValues(template);

      expect(result).toBe(template);
    });

    it("should still clean up line breaks outside code", () => {
      const result = filler.replaceTemplateValues(
        "Some text\n# Heading\n<div>\n\n\nAfter\n",
      );

      expect(result).toBe("Some text\r\n\r\n# Heading\n<div>\r\nAfter\n");
    });

    it("should still replace template values inside code", () => {
      const result = filler.replaceTemplateValues(
        "```shell\nnpm i @aurodesignsystem/{{ withAuroNamespace name }}\n```\n",
      );

      expect(result).toBe(
        "```shell\nnpm i @aurodesignsystem/auro-button\n```\n",
      );
    });
  });
});
