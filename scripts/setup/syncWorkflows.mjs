#!/usr/bin/env node

// Copyright (c) Alaska Air. All right reserved. Licensed under the Apache-2.0 license
// See LICENSE in the project root for license information.

// ---------------------------------------------------------------------

/** 
* This script is for the purpose of keeping a component repository in sync with the latest set of github workflows defined for Auro components. 
* Running this script will replace the current files with the latest defined github workflows for Auro components.
* There is also an option to delete all existing files in the directory before copying over the latest github workflow files. **/


import AuroLibraryUtils from "../utils/auroLibraryUtils.mjs";

const auroLibraryUtils = new AuroLibraryUtils();

export default class AuroWorkflows {
  copyWorkflowConfigurations() {
    auroLibraryUtils.auroLogger(' SYNC TO LATEST WORKFLOW CONFIGURATIONS', 'info', true);

    const srcDir = './node_modules/@aurodesignsystem/auro-library/componentTemplates/workflows';
    const destDir = './.github/workflows';
    
    auroLibraryUtils.copyDirectory(srcDir, destDir, false);
  }
}
