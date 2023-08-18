// Copyright (c) Alaska Air. All right reserved. Licensed under the Apache-2.0 license
// See LICENSE in the project root for license information.

// ---------------------------------------------------------------------

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export default class AuroLibraryUtils {

  /**
   * Copys and pastes all files in a source directory into a destination directory.
   * @param {String} srcDir - File path of directory to copy from.
   * @param {String} destDir - File path of directory to paste files into.
   * @param {Boolean} removeFiles - If true, removes all files in destination directory before pasting files.
   */
  copyDirectory(srcDir, destDir, removeFiles) {
    // Removes all files from directory
    if (removeFiles && fs.existsSync(destDir)) {
      const destFiles = fs.readdirSync(destDir);

      let filesRemoved = 0;
      let filesFailed = 0;
  
      destFiles.forEach(file => {
        try {
          const filePath = path.join(destDir, file);
          fs.unlinkSync(filePath);
          this.auroLogger(`Removed file: ${file}`, 'success', false);

          filesRemoved += 1;
        } catch(err) {
          this.auroLogger(`Failed to remove ${file}: ${err}`, 'error', false);
          filesFailed += 1;
        }
      });

      if (filesRemoved > 0) {
        this.auroLogger(`Removed ${filesRemoved} files`, 'success', false);
      }

      if (filesFailed > 0) {
        this.auroLogger(`Failed to remove ${filesRemoved} files`, 'error', false);
      }
    }

    // Creates destination directory if it does not exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir);
    }
  
    // All files from source directory
    const files = fs.readdirSync(srcDir);
  
    // Copys over all files from source directory to destination directory
    files.forEach(file => {
      const sourceFilePath = path.join(srcDir, file);
      const destFilePath = path.join(destDir, file);
  
      const stat = fs.statSync(sourceFilePath);
  
      if (stat.isDirectory()) {
        this.copyDirectory(srcDir, destDir, removeFiles);
      } else {
        try {
          fs.copyFileSync(sourceFilePath, destFilePath);
          this.auroLogger(`Copied file: ${file}`, 'success');
        } catch (err) {
          this.auroLogger(`Error copying file ${file}: ${err}`, 'error');
        }
      }
    });
  }

  /**
   * Logs out messages in a readble format.
   * @param {String} message - Message to be logged.
   * @param {String} status - Status that determines the color of the logged message.
   * @param {Boolean} section - If true, adds a box around the message for readability.
   */
  auroLogger(message, status, section) {
    if (status) {
      const infoColor = '#0096FF'; // blue
      const successColor = '#4CBB17'; // green
      const errorColor = '#ff0000'; // red

      let color = undefined;

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
}

