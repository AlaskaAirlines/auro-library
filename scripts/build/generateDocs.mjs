// ------------------------------------------------------
// Docs Generation
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// This script will generate the docs for the component
// based on example HTML, markdown files, and more.
//
// The actions in this file live in:
// scripts/build/processors/defaultDocsProcessor.mjs
//
// This script is intended to be run AS-IS without modification.
// To run a different processor, please see the defaultDocsProcessor.mjs file
// and re-create in your repo OR add a new processor file.
// ------------------------------------------------------

import {Logger} from "../utils/logger.mjs";
import {processDocFiles} from "./processors/defaultDocsProcessor.mjs";

processDocFiles().then(() => {
  Logger.log('Docs processed successfully');
}).
  catch((err) => {
    Logger.error(`Error processing docs: ${err.message}`);
  });
