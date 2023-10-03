#!/usr/bin/env node

// Copyright (c) Alaska Air. All right reserved. Licensed under the Apache-2.0 license
// See LICENSE in the project root for license information.

// ---------------------------------------------------------------------

/** 
* This script is for the purpose of keeping a component repository in sync with the latest set of workflows defined for Auro components. 
* Running this script will delete all workflows that exist in the repository and replace them with the latest defined workflows for Auro components. **/

import AuroWorkflows from './syncWorkflows.mjs';
import AuroLinters from './syncLinters.mjs';

import AuroLibraryUtils from '../utils/auroLibraryUtils.mjs';

const auroWorkflows = new AuroWorkflows();
const auroLinters = new AuroLinters();

const auroLibraryUtils = new AuroLibraryUtils();

const args = process.argv.slice(2);

const message = ' RUNNING SYNC ALL CONFIGURATION SCRIPTS';

if (args.length > 0) {
  const argsString = 'parameters:' + args.join(' ');

  // Prints out message and parameter passed in through script call
  auroLibraryUtils.auroLogger(`${message} \n ${argsString}`, 'info', true);
} else {
  // Prints out message
  auroLibraryUtils.auroLogger(message, 'info', true);
}

if (args.includes('--github')) {
  // Run only github workflows script
  auroWorkflows.copyWorkflowConfigurations();
} else if (args.includes('--linters')) {
  // Run only linter configuration script
  auroLinters.copyLintConfigurations();
} else {
  // Run both configuration scripts
  auroWorkflows.copyWorkflowConfigurations();
  auroLinters.copyLintConfigurations();
}
