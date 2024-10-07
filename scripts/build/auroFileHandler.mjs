import fs from 'node:fs/promises';

import {Logger} from "../utils/logger";

export class AuroFileHandler {

  /**
   * Check if a file exists.
   * @param {string} filePath - The file path to check.
   * @returns {Promise<boolean>}
   */
  static async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      return false;
    }
  }

  /**
   * Try to read a file and return its contents.
   * @param {string} filePath - The file path to read.
   * @returns {Promise<null|string>}
   */
  static async tryReadFile(filePath) {
    try {
      return await fs.readFile(filePath, {encoding: 'utf-8'});
    } catch (err) {
      Logger.error(`Error reading file: ${filePath}, ${err.message}`);
      return null;
    }
  }

  /**
   * Try to write a file with the given contents.
   * @param {string} filePath - The file path to write to.
   * @param {string} fileContents - The contents to write to the file.
   * @returns {Promise<boolean>}
   */
  static async tryWriteFile(filePath, fileContents) {
    try {
      await fs.writeFile(filePath, fileContents, {encoding: 'utf-8'});
      return true;
    } catch (err) {
      Logger.error(`Error writing file: ${filePath}, ${err.message}`);
      return false;
    }
  }

  /**
   * Try to copy a file from one location to another.
   * @param {string} source - The source file path.
   * @param {string} destination - The destination file path.
   * @returns {Promise<boolean>}
   */
  static async tryCopyFile(source, destination) {
    try {
      await fs.copyFile(source, destination);
      return true;
    } catch (err) {
      Logger.error(`Error copying file: ${source}, ${err.message}`);
      return false;
    }
  }
}
