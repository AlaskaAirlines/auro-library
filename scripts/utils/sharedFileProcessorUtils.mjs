import path from 'path';
import * as mdMagic from 'markdown-magic';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'url';

import AuroLibraryUtils from "./auroLibraryUtils.mjs";
import { AuroTemplateFiller } from "./auroTemplateFiller.mjs";
import { AuroFileHandler } from "./auroFileHandler.mjs";
import {Logger} from "./logger.mjs";


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
 * Configuration for Markdown magic
 *
 * Below is the main config for `markdown-magic` - copy-pasted directly from the library
 *
 * @typedef {object} MarkdownMagicOptions
 * @property {string} matchWord - [v2-only] string to match for variables
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
  matchWord: "AURO-GENERATED-CONTENT",
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
// TODO: test this in auro-flight before merging to main
export function fromAuroComponentRoot(pathLike) {
  const currentDir = fileURLToPath(new URL('.', import.meta.url))
  return path.join(currentDir, `${auroLibraryUtils.getProjectRootPath}${pathLike}`)
}


// External assets
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Generate a URL for the WC Generator README file.
 * @param {string} branchOrTag
 * @param {string} fileNameWithPath
 * @return {string}
 */
export function generateWCGeneratorUrl(branchOrTag, fileNameWithPath) {
  const baseRepoUrl = 'https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator'

  // check if tag starts with 'vX' since our tags are `v4.0.0`
  const isTag = branchOrTag.startsWith('v') &&
    /^\d+\.\d+\.\d+(-.*)?$/.test(branchOrTag.slice(1));

  if (isTag) {
    return `${baseRepoUrl}/refs/tags/${branchOrTag}/${fileNameWithPath}`;
  }

  if (branchOrTag !== 'master') {
    return `${baseRepoUrl}/refs/heads/${branchOrTag}/${fileNameWithPath}`;
  }

  return `${baseRepoUrl}/master/${fileNameWithPath}`;
}

/**
 * @param {string} branchOrTag - the git branch or tag to use for the README source
 * @param {string} [variantOverride] - override the variant string
 * @return {string}
 */
export function generateReadmeUrl(branchOrTag = 'master', variantOverride = '') {
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

  return generateWCGeneratorUrl(branchOrTag, `componentDocs/README${variantString}.md`);
}

// Main Markdown magic processors
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * This is the expected object type when passing something other than a string.
 * @typedef {Object} InputFileType
 * @property {string} remoteUrl - The remote template to fetch
 * @property {string} fileName - Path including file name to store
 * @property {boolean} [overwrite] - Default is true. Choose to overwrite the file if it exists
 */


/**
 * @typedef {Object} FileProcessorConfig
 * @property {string} identifier - A unique identifier for this file (used for logging).
 * @property {string | InputFileType} input - path to an input file, including filename
 * @property {string} output - path to an output file, including filename
 * @property {Partial<MarkdownMagicOptions>} [mdMagicConfig] - extra configuration options for md magic
 * @property {Array<(contents: string) => string>} [postProcessors] - extra processor functions to run on content
 */


// Individual file processing steps
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Retrieve a remote file using a provided configuration and store at a local path.
 * @param {InputFileType} input - the input file configuration
 * @return {Promise<void>}
 */
export async function retrieveRemoteFileCopy(input) {
  const bareFileName = input.fileName

  Logger.log(`Retrieving latest "${bareFileName}" file...`);

  // 0b. Attempt to populate from remote file
  const contents = await fetch(input.remoteUrl, {
    redirect: 'follow'
  }).then(r => r.text());

  // 0c. Write remote contents to local folder as cache
  await AuroFileHandler.tryWriteFile(input.fileName, contents);
}


/**
 * Run markdown magic on a file.
 * @param {string} input
 * @param {string} output
 * @param {Partial<MarkdownMagicOptions>} [extraMdMagicConfig] - extra configuration options for md magic
 * @return {Promise<void>}
 */
export async function runMarkdownMagicOnFile(input, output, extraMdMagicConfig = {}) {
  await applyMarkdownMagic(output, {
    ...MD_MAGIC_CONFIG,
    ...extraMdMagicConfig
  });
}


/**
 * Optionally copy a file to a new location.
 * @param {string} input - the input file path
 * @param {string} output - the output file path
 * @param {boolean} overwrite - whether to overwrite the file if it exists (default is true)
 * @return {Promise<void>}
 */
export async function optionallyCopyFile(input, output, overwrite = true) {
  if (await AuroFileHandler.exists(output) && !overwrite) {
    return;
  }

  if (!await AuroFileHandler.tryCopyFile(input, output)) {
    throw new Error(`Error copying "${input}" file to output ${output}`);
  }
}

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
  const { input: rawInput, output, mdMagicConfig } = config

  // Helper vars
  const derivedInputPath = typeof rawInput === 'string' ? rawInput : rawInput.fileName;
  const segments = derivedInputPath.split("/")
  const bareFileName = segments[segments.length - 1]

  // 0. Optionally retrieve a remote file
  if (typeof rawInput === 'object') {
    await retrieveRemoteFileCopy(rawInput);
  }

  // 1. Copy input or local input cache to output
  await optionallyCopyFile(derivedInputPath, output, rawInput.overwrite ?? true);

  // 2. If the file is a Markdown file, run markdown magic to inject contents and perform replacements
  if (output.endsWith(".md")) {
    await runMarkdownMagicOnFile(derivedInputPath, output, mdMagicConfig);
  }

  // 3a. Read the output file contents
  let fileContents = await fs.readFile(output, {encoding: 'utf-8'});

  // 3b. Replace template variables in output file
  fileContents = templateFiller.replaceTemplateValues(fileContents);

  // 3c. Run any post-processors
  if (config.postProcessors) {
    for (const processor of config.postProcessors) {
      fileContents = processor(fileContents)
    }
  }

  // 3d. Write the final file contents
  if (!await AuroFileHandler.tryWriteFile(output, fileContents)) {
    throw new Error(`Error writing "${bareFileName}" file to output ${output}`);
  }
}
