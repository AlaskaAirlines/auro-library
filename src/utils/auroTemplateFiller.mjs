// eslint-disable

import fs from "node:fs/promises";
import Handlebars from "handlebars";

// declare package.json type with jsdoc
/**
 * @typedef {Object} ExamplePackageJson
 * @property {string} name - Name of the package.
 * @property {string} version - Version of the package.
 * @property {Record<string, string>} peerDependencies - Peer dependencies of the package.
 */

// declare extracted names type with jsdoc
/**
 * @typedef {Object} ExtractedNames
 * @property {string} npm - NPM of the package.
 * @property {string} namespace - Namespace of the package.
 * @property {string} namespaceCap - Capitalized namespace of the package.
 * @property {string} name - Name of the package.
 * @property {string} nameCap - Capitalized name of the package.
 * @property {string} version - Version of the package.
 * @property {string} tokensVersion - Version of the design tokens.
 * @property {string} wcssVersion - Version of the webcorestylesheets.
 */

/** Matches a markdown code fence: opening line, body, closing line. */
const FENCED_CODE_PATTERN =
  /^([ \t]*(`{3,}|~{3,})[^\r\n]*(?:\r\n|\r|\n))([\s\S]*?)((?:\r\n|\r|\n)[ \t]*\2[ \t]*)$/gm;

/** Matches a `<pre>` element: opening tag, body, closing tag. */
const PRE_ELEMENT_PATTERN = /(<pre\b[^>]*>)([\s\S]*?)(<\/pre>)/gi;

/** Placeholder standing in for a stashed code body. */
const CODE_BODY_TOKEN = /\uE000(\d+)\uE000/g;

/**
 * Run a transform over markdown without letting it touch the bodies of fenced
 * code blocks or `<pre>` elements. Bodies are swapped for placeholders before
 * the transform and restored afterwards, so code snippets keep their exact
 * whitespace while the fences and tags themselves stay visible to the transform.
 * @param {string} content - The markdown to transform.
 * @param {(content: string) => string} transform - The transform to apply outside code.
 * @return {string}
 */
export function transformOutsideCode(content, transform) {
  const bodies = [];
  const stash = (body) => `\uE000${bodies.push(body) - 1}\uE000`;

  const shielded = content
    .replace(
      FENCED_CODE_PATTERN,
      (_match, open, _fence, body, close) => `${open}${stash(body)}${close}`,
    )
    .replace(
      PRE_ELEMENT_PATTERN,
      (_match, open, body, close) => `${open}${stash(body)}${close}`,
    );

  // A body can itself contain a stashed body (a fence inside a <pre>), so keep
  // restoring until no placeholders remain.
  let result = transform(shielded);
  let previous;
  do {
    previous = result;
    result = result.replace(CODE_BODY_TOKEN, (_match, index) => bodies[index]);
  } while (result !== previous);

  return result;
}

export class AuroTemplateFiller {
  static designTokenPackage = "@aurodesignsystem/design-tokens";
  static webCoreStylesheetsPackage = "@aurodesignsystem/webcorestylesheets";

  constructor() {
    /** @type {ExtractedNames} */
    this.values = null;
  }

  async prepare() {
    await this.extractNames();
  }

  /**
   * Extract various data for filling template files from the package.json file.
   * @returns {Promise<ExtractedNames>}
   */
  async extractNames() {
    const packageJsonData = await fs.readFile("package.json", "utf8");

    /** @type {ExamplePackageJson} */
    const parsedPackageJson = JSON.parse(packageJsonData);

    const pName = parsedPackageJson.name;
    const pVersion = parsedPackageJson.version;
    const pdtVersion =
      parsedPackageJson.peerDependencies?.[
        AuroTemplateFiller.designTokenPackage
      ]?.substring(1) ?? "";
    const wcssVersion =
      parsedPackageJson.peerDependencies?.[
        AuroTemplateFiller.webCoreStylesheetsPackage
      ]?.substring(1) ?? "";

    const npmStart = pName.indexOf("@");
    const namespaceStart = pName.indexOf("/");
    const nameStart = pName.indexOf("-");
    const packageNamespace = pName.substring(namespaceStart + 1, nameStart);

    if (nameStart === -1) {
      throw new Error(
        `No name can be derived from package.json "name" field: '${pName}'. Expected pattern with \`-\` split like [\`@aurodesignsystem/auro-component\` or \`@aurodesignsystem/eslint-config\`, etc.]`,
      );
    }

    this.values = {
      npm: pName.substring(npmStart, namespaceStart),
      namespace: packageNamespace,
      namespaceCap:
        pName.substring(namespaceStart + 1)[0].toUpperCase() +
        pName.substring(namespaceStart + 2, nameStart),
      name: pName.substring(nameStart + 1),
      nameCap:
        pName.substring(nameStart + 1)[0].toUpperCase() +
        pName.substring(nameStart + 2),
      version: pVersion,
      tokensVersion: pdtVersion,
      wcssVersion,
    };
  }

  /**
   * @param {string} template - The string to use to run variable replacement
   * @param {object} extraVars - Additional variables to use in the template
   * @return {string}
   */
  replaceTemplateValues(template, extraVars = {}) {
    const compileResult = Handlebars.compile(template);

    // replace all handlebars placeholders FIRST, then apply legacy replacements
    let result = compileResult(
      {
        // TODO: consider replacing some of these with handlebars helpers
        name: this.values.name,
        Name: this.values.nameCap,
        namespace: this.values.namespace,
        Namespace: this.values.namespaceCap,
        Version: this.values.version,
        dtVersion: this.values.tokensVersion,
        wcssVersion: this.values.wcssVersion,
        ...extraVars,
      },
      {
        helpers: {
          capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
          // Hard codes `auro-*` with whatever string is passed in.
          withAuroNamespace: (str) => `auro-${str}`,
          // Recreats the string from package.json: auro-component, eslint-config, etc.
          packageName: () =>
            `${this.values["namespace"]}-${this.values["name"]}`,
        },
      },
    );

    /**
     * Old legacy template variables. We used to use `[varName]` and are now using handlebars `{{varName}}`.
     * @type {[{pattern: RegExp, replacement: string},{pattern: RegExp, replacement: string},{pattern: RegExp, replacement: string},{pattern: RegExp, replacement: string},{pattern: RegExp, replacement: string},null,null,null]}
     */
    const legacyTemplateVariables = [
      {
        pattern: /\[npm\]/gu,
        replacement: this.values.npm,
      },
      {
        pattern: /\[name\](?!\()/gu,
        replacement: this.values.name,
      },
      {
        pattern: /\[Name\](?!\()/gu,
        replacement: this.values.nameCap,
      },
      {
        pattern: /\[namespace\]/gu,
        replacement: this.values.namespace,
      },
      {
        pattern: /\[Namespace\]/gu,
        replacement: this.values.namespaceCap,
      },
      {
        pattern: /\[Version\]/gu,
        replacement: this.values.version,
      },
      {
        pattern: /\[dtVersion\]/gu,
        replacement: this.values.tokensVersion,
      },
      {
        pattern: /\[wcssVersion\]/gu,
        replacement: this.values.wcssVersion,
      },
    ];

    /**
     * Replace legacy placeholder strings.
     */
    for (const { pattern, replacement } of legacyTemplateVariables) {
      result = result.replace(pattern, replacement);
    }

    /**
     * Cleanup line breaks. Code bodies are left untouched so snippets render
     * (and copy) exactly as written — e.g. a CSS `#id` rule or a shell `#`
     * comment is not mistaken for a markdown heading.
     */
    return transformOutsideCode(result, (prose) => {
      let cleaned = prose;
      cleaned = cleaned.replace(/(\r\n|\r|\n)[\s]+(\r\n|\r|\n)/g, "\r\n\r\n"); // Replace lines containing only whitespace with a carriage return.
      cleaned = cleaned.replace(/>(\r\n|\r|\n){2,}/g, ">\r\n"); // Remove empty lines directly after a closing html tag.
      cleaned = cleaned.replace(/>(\r\n|\r|\n)```/g, ">\r\n\r\n```"); // Ensure an empty line before code samples.
      cleaned = cleaned.replace(
        />(\r\n|\r|\n){2,}```(\r\n|\r|\n)/g,
        ">\r\n```\r\n",
      ); // Ensure no empty lines before close of code sample.
      cleaned = cleaned.replace(
        /([^(\r\n|\r|\n)])(\r?\n|\r(?!\n))+#/g,
        "$1\r\n\r\n#",
      ); // Ensure empty line before header sections.
      return cleaned;
    });
  }

  /**
   *
   * @param {string} content
   */
  formatApiTable(content) {
    let result = `${content}`;

    result = result
      .replace(
        /\r\n|\r|\n####\s`([a-zA-Z]*)`/g,
        `\r\n#### <a name="$1"></a>\`$1\`<a href="#" style="float: right; font-size: 1rem; font-weight: 100;">back to top</a>`,
      )
      .replace(/\r\n|\r|\n\|\s`([a-zA-Z]*)`/g, "\r\n| [$1](#$1)")
      .replace(/\| \[\]\(#\)/g, "");

    return result;
  }
}
