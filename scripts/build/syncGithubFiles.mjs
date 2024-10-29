import {Logger} from "../utils/logger.mjs";
import {
  fromAuroComponentRoot,
  generateReadmeUrl, generateWCGeneratorUrl,
  processContentForFile,
  templateFiller
} from "../utils/sharedFileProcessorUtils.mjs";

// Finally, the main function
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Processor config object.
 * @typedef {Object} ProcessorConfig
 * @property {boolean} [overwriteLocalCopies=true] - The release version tag to use instead of master.
 * @property {string} [generatorTemplateVersion="master"] - The release version tag to use instead of master.
 * (like "_esm" to make README_esm.md).
 */

const DOT_GITHUB_PATH = '.github';
const ISSUE_TEMPLATE_PATH = `${DOT_GITHUB_PATH}/ISSUE_TEMPLATE`;

/**
 * @param {ProcessorConfig} config - The configuration for this processor.
 * @return {import('../utils/sharedFileProcessorUtils').FileProcessorConfig[]}
 */
const generateFiles = (config) => [
  // bug_report.yml
  {
    identifier: 'bug_report.yml',
    input: {
      remoteUrl: generateWCGeneratorUrl(config.generatorTemplateVersion, `templates/${ISSUE_TEMPLATE_PATH}/bug_report.yml`),
      fileName: fromAuroComponentRoot(`docTemplates/${ISSUE_TEMPLATE_PATH}/bug_report.yml`),
      overwrite: config.overwriteLocalCopies
    },
    output: fromAuroComponentRoot(`${ISSUE_TEMPLATE_PATH}/bug_report.yml`)
  },
  // config.yml
  {
    identifier: 'config.yml',
    input: {
      remoteUrl: generateWCGeneratorUrl(config.generatorTemplateVersion, `templates/${ISSUE_TEMPLATE_PATH}/config.yml`),
      fileName: fromAuroComponentRoot(`docTemplates/${ISSUE_TEMPLATE_PATH}/config.yml`),
      overwrite: config.overwriteLocalCopies
    },
    output: fromAuroComponentRoot(`${ISSUE_TEMPLATE_PATH}/config.yml`)
  },
  // PULL_REQUEST_TEMPLATE.md
  {
    identifier: 'PULL_REQUEST_TEMPLATE.md',
    input: {
      remoteUrl: generateWCGeneratorUrl(config.generatorTemplateVersion, `templates/${DOT_GITHUB_PATH}/PULL_REQUEST_TEMPLATE.md`),
      fileName: fromAuroComponentRoot(`docTemplates/${DOT_GITHUB_PATH}/PULL_REQUEST_TEMPLATE.md`),
      overwrite: config.overwriteLocalCopies
    },
    output: fromAuroComponentRoot(`${DOT_GITHUB_PATH}/PULL_REQUEST_TEMPLATE.md`)
  },
];

/**
 *
 * @param {ProcessorConfig} config - The configuration for this processor.
 * @return {Promise<void>}
 */
export async function syncGithubFiles(config = {
  overwriteLocalCopies: true,
  generatorTemplateVersion: "master",
}) {
  // setup
  await templateFiller.extractNames();

  for (const file of generateFiles(config)) {
    try {
      Logger.log(`Processing file: ${file.identifier}`);
      // eslint-disable-next-line no-await-in-loop
      await processContentForFile(file);
    } catch (error) {
      Logger.error(`Error processing file: ${file.identifier}, ${error.message}`);
    }
  }
}

syncGithubFiles().then(() => {
  Logger.log('Docs processed successfully');
}).
  catch((err) => {
    Logger.error(`Error processing docs: ${err.message}`);
  });
