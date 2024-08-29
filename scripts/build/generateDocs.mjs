import path from 'path';
import * as mdMagic from 'markdown-magic';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'url';

import AuroLibraryUtils from "../utils/auroLibraryUtils.mjs";
import { AuroTemplateFiller } from "./auroTemplateFiller.mjs";
import {Logger} from "../utils/logger.mjs";


// This JSDoc type trickery is here so you get "decent enough" auto complete
/** @type {typeof import('markdown-magic').markdownMagic} */
const applyMarkdownMagic = mdMagic.default

/**
 * Optional output configuration
 * @typedef  {object}   OutputConfig
 * @property {string}   [directory] - Change output path of new content. Default behavior is replacing the original file
 * @property {boolean}  [removeComments = false] - Remove comments from output. Default is false.
 * @property {function} [pathFormatter] - Custom function for altering output paths
 * @property {boolean}  [applyTransformsToSource = false] - Apply transforms to source file. Default is true. This is for when outputDir is set.
 */

/**
 * Configuration for markdown magic
 *
 * Below is the main config for `markdown-magic` - copy-pasted directly from the library
 *
 * @typedef {object} MarkdownMagicOptions
 * @property {FilePathsOrGlobs} [files] - Files to process.
 * @property {Array} [transforms = defaultTransforms] - Custom commands to transform block contents, see transforms & custom transforms sections below.
 * @property {OutputConfig} [output] - Output configuration
 * @property {SyntaxType} [syntax = 'md'] - Syntax to parse
 * @property {string} [open = 'doc-gen'] - Opening match word
 * @property {string} [close = 'end-doc-gen'] - Closing match word. If not defined will be same as opening word.
 * @property {string} [cwd = process.cwd() ] - Current working directory. Default process.cwd()
 * @property {boolean} [outputFlatten] - Flatten files that are output
 * @property {boolean} [useGitGlob] - Use git glob for LARGE file directories
 * @property {boolean} [dryRun = false] - See planned execution of matched blocks
 * @property {boolean} [debug = false] - See debug details
 * @property {boolean} [silent = false] - Silence all console output
 * @property {boolean} [applyTransformsToSource = true] - Apply transforms to source file. Default is true.
 * @property {boolean} [failOnMissingTransforms = false] - Fail if transform functions are missing. Default skip blocks.
 * @property {boolean} [failOnMissingRemote = true] - Fail if remote file is missing.
 */


// Config
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/** @type {MarkdownMagicOptions} */
export const MD_MAGIC_CONFIG = {
  open: "AURO-GENERATED-CONTENT:START",
  close: "AURO-GENERATED-CONTENT:END",
  output: {
    directory: "./",
    applyTransformsToSource: true
  }
};

// Initialize utility services
export const auroLibraryUtils = new AuroLibraryUtils();
export const templateFiller = new AuroTemplateFiller();

// List of components that do not support ESM to determine which README to use
export const nonEsmComponents = ['combobox', 'datepicker', 'menu', 'pane', 'select'];


// Local utils
/**
 *
 * @param {string} pathLike - Please include the preceding slash! Like so: `/docTemplates/README.md`
 * @return {string}
 */
export function fromAuroComponentRoot(pathLike) {
  const currentDir = fileURLToPath(new URL('.', import.meta.url))
  return path.join(currentDir, `${auroLibraryUtils.projectRootFromBuildScriptDir}${pathLike}`)
}


// External assets
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * @param {string} tag - the release version tag to use instead of master
 * @param {string} [variantOverride] - override the variant string
 * @return {string}
 */
export function generateReadmeUrl(tag = 'master', variantOverride = '') {
  // LEGACY CODE FOR NON-ESM COMPONENTS

  const nameExtractionData = templateFiller.values;
  let variantString = '';

  if (!nonEsmComponents.includes(nameExtractionData.name)) {
    variantString = '_esm';
  }

  // END LEGACY CODE

  if (variantOverride !== '') {
    variantString = variantOverride;
  }

  const baseRepoUrl = 'https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator'
  if (tag !== 'master') {
    return `${baseRepoUrl}/refs/tags/${tag}/componentDocs/README` + variantString + '.md';
  }

  return `${baseRepoUrl}/master/componentDocs/README` + variantString + '.md';
}

// Main Markdown magic processors
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * This is the expected object type when passing something other than a string.
 * @typedef {Object} InputFileType
 * @property {string} remoteUrl - The remote template to fetch
 * @property {string} fileName - Path including file name to store
 * @property {boolean?} overwrite - Write contents regardless of existing template file
 */


/**
 * @typedef {Object} FileProcessorConfig
 * @property {string | InputFileType} input - path to input file, including filename
 * @property {string} output - path to output file, including filename
 * @property {Partial<MarkdownMagicOptions>} [mdMagicConfig] - extra configuration options for md magic
 * @property {Array<(contents: string) => string>} [postProcessors] - extra processor functions to run on content
 */

/**
 * Process the content of a file.
 *
 * This is a high level function that performs the following via lower functions:
 * - Read contents of file
 * - Run "markdown-magic" on file contents (optional, *.md specific)
 * - Run template variable replacement on file contents
 * @param {FileProcessorConfig} config - the config for this file
 */
export async function processContentForFile(config) {
  const { input, output, mdMagicConfig } = config

  // TODO: Extract this file name derive feature into utility
  const derivedInputPath = typeof input === 'string' ? input : input.fileName;
  const segments = derivedInputPath.split("/")
  const bareFileName = segments[segments.length - 1]

  // (optional) 0. If configured to pull from a remote file, fetches that first
  if (typeof input === "object") {
    // 0a. Check if local copy exists AND overwrite not set
    if (!input.overwrite && await auroLibraryUtils.existsAsync(input.fileName)) {
      Logger.warn(`NOTICE: Using existing "${bareFileName}" file`);
      await fs.copyFile(input.fileName, output);
    } else {
      // Either overwrite is TRUE or file doesn't exist, so get the file
      Logger.log(`Retrieving latest "${bareFileName}" file...`);

      // 0b. Attempt to populate from remote file
      const contents = await fetch(input.remoteUrl, {
        redirect: 'follow'
      }).then(r => r.text());

      // 0c. Write remote contents to local folder as cache
      await fs.writeFile(input.fileName, contents, {encoding: 'utf-8'});
    }
  }

  // 1. Copy input or local input cache to output
  await fs.copyFile(derivedInputPath, output);

  // 2. If markdown file, run markdown magic to inject contents and perform replacements
  if (output.endsWith(".md")) {
    const extraConfig = mdMagicConfig ? mdMagicConfig : {}
    await applyMarkdownMagic(output, {
      matchWord: 'AURO-GENERATED-CONTENT',
      ...MD_MAGIC_CONFIG,
      ...extraConfig
    });
  }

  // 3. Replace template variables in output file
  let fileContents = await fs.readFile(output, {encoding: 'utf-8'});
  fileContents = templateFiller.replaceTemplateValues(fileContents);
  if (config.postProcessors) {
    for (const processor of config.postProcessors) {
      fileContents = processor(fileContents)
    }
  }

  await fs.writeFile(output, fileContents, {encoding: 'utf-8'});
}

// Finally, the main function
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 *
 * @param {string} remoteReadmeVersion - the release version tag to use instead of master
 * @param {string} [readmeVariant] - the release version tag to use instead of master
 * @return {Promise<void>}
 */
export async function processDocFiles(remoteReadmeVersion = 'master', readmeVariant = undefined) {
  // setup
  await templateFiller.extractNames();

  // process
  // README.md

  await processContentForFile({
    input: {
      remoteUrl: generateReadmeUrl(remoteReadmeVersion, readmeVariant),
      overwrite: false,
      fileName: fromAuroComponentRoot(`/docTemplates/README.md`),
    },
    output: fromAuroComponentRoot("/README.md")
  })

  // Demo MD file
  await processContentForFile({
    input: fromAuroComponentRoot("/docs/partials/index.md"),
    output: fromAuroComponentRoot("/demo/index.md"),
    mdMagicConfig: {
      output: {
        directory: fromAuroComponentRoot("/demo")
      }
    }
  })

  // API MD file
  await processContentForFile({
    input: fromAuroComponentRoot("/docs/partials/api.md"),
    output: fromAuroComponentRoot("/demo/api.md"),
    postProcessors: [
      templateFiller.formatApiTable
    ]
  })
}
