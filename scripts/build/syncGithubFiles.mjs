// ------------------------------------------------------
// GitHub Config Sync
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// This script will synchronize shared GitHub config
// files to the local repo (eventually, anything that lives
// in the .github directory).
//
// The actions in this file live in:
// scripts/build/processors/defaultDotGithubSync.mjs
//
// This script is intended to be run AS-IS without modification.
// To run a different processor, please see the defaultDotGithubSync.mjs file
// and re-create in your repo OR add a new processor file.
// ------------------------------------------------------

import {syncGithubFiles} from "./processors/defaultDotGithubSync.mjs";
import {Logger} from "../utils/logger.mjs";

syncGithubFiles().then(() => {
  Logger.log('Docs processed successfully');
}).
  catch((err) => {
    Logger.error(`Error processing docs: ${err.message}`);
  });
