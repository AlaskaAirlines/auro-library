// Copyright (c) Alaska Air. All right reserved. Licensed under the Apache-2.0 license
// See LICENSE in the project root for license information.

// ---------------------------------------------------------------------

/* eslint-disable arrow-parens, line-comment-position, no-console, no-inline-comments, no-magic-numbers, prefer-arrow-callback, require-unicode-regexp, jsdoc/require-description-complete-sentence, prefer-named-capture-group */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import {Logger} from "./logger.mjs";

export default class AuroLibraryUtils {
  getDirname() {
    if (typeof __dirname === 'undefined') {
      Logger.warn('Unable to determine project root as __dirname is not defined. Assuming current directory is okay!', true);
      return '';
    }

    // eslint-disable-next-line no-undef
    return __dirname;
  }

  get projectRootFromBuildScriptDir() {
    const currentDir = this.getDirname();

    if (!currentDir.includes('node_modules')) {
      Logger.warn(`Unable to determine best project root as node_modules is not in the directory path. Assuming ${currentDir} is okay!`, true);
      return currentDir;
    }

    return currentDir.split('node_modules')[0];
  }

  /**
   * Copies and pastes all files in a source directory into a destination directory.
   * @param {String} srcDir - File path of directory to copy from.
   * @param {String} destDir - File path of directory to paste files into.
   * @param {Boolean} removeFiles - If true, removes all files in destination directory before pasting files.
   */
  copyDirectory(srcDir, destDir, removeFiles) {
    if (!fs.existsSync(srcDir)) {
      this.auroLogger(`Source directory ${srcDir} does not exist`, 'error', false);
    } else {
      // Removes all files from directory
      if (removeFiles && fs.existsSync(destDir)) {
        const destFiles = fs.readdirSync(destDir);

        let filesRemoved = 0;

        destFiles.forEach(file => {
          const filePath = path.join(destDir, file);
          fs.unlinkSync(filePath);
          this.auroLogger(`Removed file: ${file}`, 'success', false);

          filesRemoved += 1;
        });

        if (filesRemoved > 0) {
          this.auroLogger(`Removed ${filesRemoved} files`, 'success', false);
        }
      }

      // Creates destination directory if it does not exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
      }

      // All files from source directory
      const files = fs.readdirSync(srcDir);

      // Copies over all files from source directory to destination directory
      files.forEach(file => {
        const sourceFilePath = path.join(srcDir, file);
        const destFilePath = path.join(destDir, file);

        const stat = fs.statSync(sourceFilePath);

        if (stat.isDirectory()) {
          this.copyDirectory(srcDir, destDir, removeFiles);
        } else {
          fs.copyFileSync(sourceFilePath, destFilePath);

          fs.readFile(destFilePath, 'utf8', (err, data) => {
            this.formatFileContents(data, destFilePath);
          });

          this.auroLogger(`Copied file: ${file}`, 'success');
        }
      });
    }
  }

  /**
   * Logs out messages in a readable format.
   * @param {String} message - Message to be logged.
   * @param {"info" | "success" | "error"} status - Status that determines the color of the logged message.
   * @param {Boolean} section - If true, adds a box around the message for readability.
   */
  auroLogger(message, status, section) {
    if (status) {
      const infoColor = '#0096FF'; // blue
      const successColor = '#4CBB17'; // green
      const errorColor = '#ff0000'; // red

      let color = undefined; // eslint-disable-line no-undef-init

      if (status === 'info') {
        color = infoColor;
      } else if (status === 'success') {
        color = successColor;
      } else if (status === 'error') {
        color = errorColor;
      }

      if (section) {
        console.log(chalk.hex(color)(`╭ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ──────────────────────────────╮\n`));
      }

      console.log(chalk.hex(color)(message));

      if (section) {
        console.log(chalk.hex(color)('\n╰─────────────────────────────── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╯'));
      }
    } else {
      if (section) {
        console.log(`╭ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ──────────────────────────────╮\n`);
      }

      console.log(message);

      if (section) {
        console.log(`\n╰─────────────────────────────── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╯`);
      }
    }
  }

  /**
   * Extracts NPM VERSION, BRANCH NAME, NPM, NAMESPACE, and NAME from package.json.
   * @returns {Object} result - Object containing data from package.json.
   */
  nameExtraction() {
    let packageJson = fs.readFileSync('package.json', 'utf8', function(err) {
      if (err) {
        console.log('ERROR: Unable to read package.json file', err);
      }
    });

    packageJson = JSON.parse(packageJson);

    const pName = packageJson.name;
    const npmStart = pName.indexOf('@');
    const namespaceStart = pName.indexOf('/');
    const nameStart = pName.indexOf('-');

    return {
      'abstractNodeVersion': packageJson.engines.node.substring(2),
      'branchName': packageJson.release.branch,
      'npm': pName.substring(npmStart, namespaceStart),
      'namespace': pName.substring(namespaceStart + 1, nameStart),
      'namespaceCap': pName.substring(namespaceStart + 1)[0].toUpperCase() + pName.substring(namespaceStart + 2, nameStart),
      'name': pName.substring(nameStart + 1),
      'nameCap': pName.substring(nameStart + 1)[0].toUpperCase() + pName.substring(nameStart + 2),
      'version': packageJson.version,
      'tokensVersion': packageJson.peerDependencies['\@aurodesignsystem/design-tokens'].substring(1),
      'wcssVersion': packageJson.peerDependencies['\@aurodesignsystem/webcorestylesheets'].substring(1)

    };
  }

  /**
   * Replace all instances of [abstractNodeVersion], [branchName], [npm], [name], [Name], [namespace] and [Namespace] accordingly.
   * @param {String} content - The content to be formatted.
   * @param {String} destination - The location to write the formatted content.
   * @returns {void}
   */
  formatFileContents(content, destination) {
    const nameExtractionData = this.nameExtraction();
    let result = content;

    /**
     * Replace placeholder strings.
     */
    result = result.replace(/\[abstractNodeVersion]/g, nameExtractionData.abstractNodeVersion);
    result = result.replace(/\[branchName]/g, nameExtractionData.branchName);
    result = result.replace(/\[npm]/g, nameExtractionData.npm);
    result = result.replace(/\[name](?!\()/g, nameExtractionData.name);
    result = result.replace(/\[Name](?!\()/g, nameExtractionData.nameCap);
    result = result.replace(/\[namespace]/g, nameExtractionData.namespace);
    result = result.replace(/\[Namespace]/g, nameExtractionData.namespaceCap);
    result = result.replace(/\[Version]/g, nameExtractionData.version);
    result = result.replace(/\[dtVersion]/g, nameExtractionData.tokensVersion);
    result = result.replace(/\[wcssVersion]/g, nameExtractionData.wcssVersion);

    /**
     * Cleanup line breaks.
     */
    result = result.replace(/(\r\n|\r|\n)[\s]+(\r\n|\r|\n)/g, '\r\n\r\n'); // Replace lines containing only whitespace with a carriage return.
    result = result.replace(/>(\r\n|\r|\n){2,}/g, '>\r\n'); // Remove empty lines directly after a closing html tag.
    result = result.replace(/>(\r\n|\r|\n)```/g, '>\r\n\r\n```'); // Ensure an empty line before code samples.
    result = result.replace(/>(\r\n|\r|\n){2,}```(\r\n|\r|\n)/g, '>\r\n```\r\n'); // Ensure no empty lines before close of code sample.
    result = result.replace(/([^(\r\n|\r|\n)])(\r?\n|\r(?!\n))+#/g, "$1\r\n\r\n#"); // Ensure empty line before header sections.

    /**
     * Write the result to the destination file.
     */
    fs.writeFileSync(destination, result, { encoding: 'utf8'});
  }
}

