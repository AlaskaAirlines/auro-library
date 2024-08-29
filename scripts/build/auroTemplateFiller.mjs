// eslint-disable
import Handlebars from "handlebars"
import fs from "node:fs/promises";

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


export class AuroTemplateFiller {
  static designTokenPackage = '@aurodesignsystem/design-tokens';
  static webCoreStylesheetsPackage = '@aurodesignsystem/webcorestylesheets';

  constructor () {
    /** @type {ExtractedNames} */
    this.values = null;
  }

  async prepare() {
    await this.extractNames()
  }

  /**
   * Extract various data for filling template files from the package.json file.
   * @returns {Promise<ExtractedNames>}
   */
  async extractNames() {
    const packageJsonData = await fs.readFile('package.json', 'utf8');

    /** @type {ExamplePackageJson} */
    const parsedPackageJson = JSON.parse(packageJsonData);

    const pName = parsedPackageJson.name;
    const pVersion = parsedPackageJson.version;
    const pdtVersion = parsedPackageJson.peerDependencies[AuroTemplateFiller.designTokenPackage].substring(1);
    const wcssVersion = parsedPackageJson.peerDependencies[AuroTemplateFiller.webCoreStylesheetsPackage].substring(1);

    const npmStart = pName.indexOf('@');
    const namespaceStart = pName.indexOf('/');
    const nameStart = pName.indexOf('-');

    this.values = {
      'npm': pName.substring(npmStart, namespaceStart),
      'namespace': pName.substring(namespaceStart + 1, nameStart),
      'namespaceCap': pName.substring(namespaceStart + 1)[0].toUpperCase() + pName.substring(namespaceStart + 2, nameStart),
      'name': pName.substring(nameStart + 1),
      'nameCap': pName.substring(nameStart + 1)[0].toUpperCase() + pName.substring(nameStart + 2),
      'version': pVersion,
      'tokensVersion': pdtVersion,
      wcssVersion
    };
  }

  /**
   * @param {string} template
   * @param {ExtractedNames} values
   * @return {string}
   */
  replaceTemplateValues(template) {
    const compileResult = Handlebars.compile(template);

    // replace all handlebars placeholders FIRST, then apply legacy replacements
    let result = compileResult({
      // TODO: consider replacing some of these with handlebars helpers
      name: this.values.name,
      Name: this.values.nameCap,
      namespace: this.values.namespace,
      Namespace: this.values.namespaceCap,
      Version: this.values.version,
      dtVersion: this.values.tokensVersion,
      wcssVersion: this.values.wcssVersion
    }, {
      helpers: {
        'capitalize': (str) => str.charAt(0).toUpperCase() + str.slice(1),
        'withAuroNamespace': (str) => `auro-${str}`,
      }
    })

    /**
     * Old legacy template variables. We used to use `[varName]` and are now using handlebars `{{varName}}`.
     * @type {[{pattern: RegExp, replacement: string},{pattern: RegExp, replacement: string},{pattern: RegExp, replacement: string},{pattern: RegExp, replacement: string},{pattern: RegExp, replacement: string},null,null,null]}
     */
    const legacyTemplateVariables = [
      {
        pattern: /\[npm\]/gu,
        replacement: this.values.npm
      },
      {
        pattern: /\[name\](?!\()/gu,
        replacement: this.values.name
      },
      {
        pattern: /\[Name\](?!\()/gu,
        replacement: this.values.nameCap
      },
      {
        pattern: /\[namespace\]/gu,
        replacement: this.values.namespace
      },
      {
        pattern: /\[Namespace\]/gu,
        replacement: this.values.namespaceCap
      },
      {
        pattern: /\[Version\]/gu,
        replacement: this.values.version
      },
      {
        pattern: /\[dtVersion\]/gu,
        replacement: this.values.tokensVersion
      },
      {
        pattern: /\[wcssVersion\]/gu,
        replacement: this.values.wcssVersion
      }
    ];

    /**
     * Replace legacy placeholder strings.
     */
    for (const { pattern, replacement } of legacyTemplateVariables) {
      result = result.replace(pattern, replacement);
    }

    /**
     * Cleanup line breaks.
     */
    result = result.replace(/(\r\n|\r|\n)[\s]+(\r\n|\r|\n)/g, '\r\n\r\n'); // Replace lines containing only whitespace with a carriage return.
    result = result.replace(/>(\r\n|\r|\n){2,}/g, '>\r\n'); // Remove empty lines directly after a closing html tag.
    result = result.replace(/>(\r\n|\r|\n)```/g, '>\r\n\r\n```'); // Ensure an empty line before code samples.
    result = result.replace(/>(\r\n|\r|\n){2,}```(\r\n|\r|\n)/g, '>\r\n```\r\n'); // Ensure no empty lines before close of code sample.
    result = result.replace(/([^(\r\n|\r|\n)])(\r?\n|\r(?!\n))+#/g, "$1\r\n\r\n#"); // Ensure empty line before header sections.

    return result;
  }


  /**
   *
   * @param {string} content
   */
  formatApiTable(content) {
    let result = `${content}`;

    result = result
      .replace(/\r\n|\r|\n####\s`([a-zA-Z]*)`/g, `\r\n#### <a name="$1"></a>\`$1\`<a href="#" style="float: right; font-size: 1rem; font-weight: 100;">back to top</a>`)
      .replace(/\r\n|\r|\n\|\s`([a-zA-Z]*)`/g, '\r\n| [$1](#$1)')
      .replace(/\| \[\]\(#\)/g, "");

    return result
  }

  /**
   * Wrapper for writing any string to a file
   * @param {string} content
   * @param {string} destination
   * @return {Promise<void>}
   */
  async writeToFile(content, destination) {
    await fs.writeFile(destination, content, {encoding: "utf-8"});
  }

  /**
   * Replace all instances of [npm], [name], [Name], [namespace] and [Namespace] accordingly.
   *
   * # WIP
   * This function is a work in progress and will be updated to handle more complex templating needs.
   * For example, we plan to directly add handlebars.js support.
   *
   * @param {string} content - The content of the template file.
   * @param {string} destination - The destination file path.
   *
   * @returns {Promise<void>}
   */
  async formatTemplateAndWriteToFile(content, destination) {
    const result = this.replaceTemplateValues(content);

    /**
     * Write the result to the destination file.
     */
    await this.writeToFile(result, destination);
  }
}
