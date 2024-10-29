import {Logger} from "../utils/logger.mjs";
import {
  fromAuroComponentRoot,
  generateReadmeUrl,
  processContentForFile,
  templateFiller
} from "../utils/sharedFileProcessorUtils.mjs";

// Finally, the main function
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Processor config object.
 * @typedef {Object} ProcessorConfig
 * @property {boolean} [overwriteLocalCopies=true] - The release version tag to use instead of master.
 * @property {string} [remoteReadmeVersion="master"] - The release version tag to use instead of master.
 * @property {string} [remoteReadmeVariant=""] - The variant string to use for the README source.
 * (like "_esm" to make README_esm.md).
 */

/**
 *
 * @param {ProcessorConfig} config - The configuration for this processor.
 * @return {Promise<void>}
 */
export async function processDocFiles(config = {
  overwriteLocalCopies: true,
  remoteReadmeVersion: "master",
  readmeVariant: ""
}) {
  const { overwriteLocalCopies, remoteReadmeVersion, readmeVariant } = config;

  // setup
  await templateFiller.extractNames();

  // process
  // README.md

  Logger.warn('WARNING: overwrite is set to FALSE for README.md - please update this when template changes are merged');
  await processContentForFile({
    input: {
      remoteUrl: generateReadmeUrl(remoteReadmeVersion, readmeVariant),
      fileName: fromAuroComponentRoot(`/docTemplates/README.md`),
      overwrite: overwriteLocalCopies
    },
    output: fromAuroComponentRoot("/README.md")
  });

  // Demo MD file
  await processContentForFile({
    input: fromAuroComponentRoot("/docs/partials/index.md"),
    output: fromAuroComponentRoot("/demo/index.md"),
    mdMagicConfig: {
      output: {
        directory: fromAuroComponentRoot("/demo")
      }
    }
  });

  // API MD file
  await processContentForFile({
    input: fromAuroComponentRoot("/docs/partials/api.md"),
    output: fromAuroComponentRoot("/demo/api.md"),
    postProcessors: [templateFiller.formatApiTable],
  });
}

processDocFiles().then(() => {
  Logger.log('Docs processed successfully');
}).
  catch((err) => {
    Logger.error(`Error processing docs: ${err.message}`);
  });
