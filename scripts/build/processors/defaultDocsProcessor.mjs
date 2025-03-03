import {Logger} from "../../utils/logger.mjs";
import {
  fromAuroComponentRoot,
  generateReadmeUrl,
  processContentForFile,
  templateFiller
} from "../../utils/sharedFileProcessorUtils.mjs";

/**
 * Processor config object.
 * @typedef {Object} ProcessorConfig
 * @property {boolean} [overwriteLocalCopies=true] - The release version tag to use instead of master.
 * @property {string} [remoteReadmeVersion="master"] - The release version tag to use instead of master.
 * @property {string} [remoteReadmeVariant=""] - The variant string to use for the README source.
 * (like "_esm" to make README_esm.md).
 */


/**
 * @param {ProcessorConfig} config - The configuration for this processor.
 */
export const defaultDocsProcessorConfig = {
  overwriteLocalCopies: true,
  remoteReadmeVersion: "master",
  // eslint-disable-next-line no-warning-comments
  // TODO: remove this variant when all components are updated to use latest auro-library
  // AND the default README.md is updated to use the new paths
  remoteReadmeVariant: "_updated_paths"
};

/**
 * @param {ProcessorConfig} config - The configuration for this processor.
 * @returns {import('../utils/sharedFileProcessorUtils').FileProcessorConfig[]}
 */
export const fileConfigs = (config) => [
  // README.md
  {
    identifier: 'README.md',
    input: {
      remoteUrl: generateReadmeUrl(config.remoteReadmeVersion, config.remoteReadmeVariant),
      fileName: fromAuroComponentRoot(`/docTemplates/README.md`),
      overwrite: config.overwriteLocalCopies
    },
    output: fromAuroComponentRoot("/README.md")
  },
  // index.md
  {
    identifier: 'index.md',
    input: fromAuroComponentRoot("/docs/partials/index.md"),
    output: fromAuroComponentRoot("/demo/index.md"),
    mdMagicConfig: {
      output: {
        directory: fromAuroComponentRoot("/demo")
      }
    }
  },
  // api.md
  {
    identifier: 'api.md',
    input: fromAuroComponentRoot("/docs/partials/api.md"),
    output: fromAuroComponentRoot("/demo/api.md"),
    preProcessors: [templateFiller.formatApiTable],
  }
];

/**
 *
 * @param {ProcessorConfig} config - The configuration for this processor.
 * @return {Promise<void>}
 */
export async function processDocFiles(config = defaultDocsProcessorConfig) {
  // setup
  await templateFiller.extractNames();

  for (const fileConfig of fileConfigs(config)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await processContentForFile(fileConfig);
    } catch (err) {
      Logger.error(`Error processing ${fileConfig.identifier}: ${err.message}`);
    }
  }
}
