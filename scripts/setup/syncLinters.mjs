#!/usr/bin/env node

// Copyright (c) Alaska Air. All right reserved. Licensed under the Apache-2.0 license
// See LICENSE in the project root for license information.

// ---------------------------------------------------------------------

/** 
* This script is for the purpose of keeping a component repository in sync with the latest lint configurations defined for Auro components. 
* Running this script will replace the current files with the latest defined configurations for Auro components. 
* There is also an option to delete all existing files in the directory before copying over the latest lint configuration files. **/

import AuroLibraryUtils from "../utils/auroLibraryUtils.mjs";

const auroLibraryUtils = new AuroLibraryUtils();

export default class AuroLinters {
  copyLintConfigurations() {
    auroLibraryUtils.auroLogger(' SYNC TO LATEST LINT CONFIGURATIONS', 'info', true);

    const srcDir = './node_modules/@aurodesignsystem/auro-library/componentTemplates/linters';
    const destDir = './.github/linters';
    
    auroLibraryUtils.copyDirectory(srcDir, destDir, false);
  }
}
