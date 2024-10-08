/* eslint-disable no-inline-comments, no-console, line-comment-position */

import chalk from 'chalk';

export class Logger {

  /**
   * Logs out messages in a readable format.
   * @param {String} message - Message to be logged.
   * @param {false | "info" | "success" | "error" | "warn"} status - Status that determines the color of the logged message.
   * @param {Boolean} section - If true, adds a box around the message for readability.
   */
  static auroLogger(message, status, section) {
    if (status !== false) {
      const infoColor = '#0096FF'; // blue
      const successColor = '#4CBB17'; // green
      const errorColor = '#ff0000'; // red
      const warningColor = '#FFA500'; // orange

      let color = undefined; // eslint-disable-line no-undef-init

      if (status === 'info') {
        color = infoColor;
      } else if (status === 'success') {
        color = successColor;
      } else if (status === 'error') {
        color = errorColor;
      } else if (status === 'warn') {
        color = warningColor;
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

  static log(message, section = false) {
    Logger.auroLogger(message, false, section);
  }

  static info(message, section = false) {
    Logger.auroLogger(message, "info", section);
  }

  static warn(message, section = false) {
    Logger.auroLogger(message, "warn", section);
  }

  static success(message, section = false) {
    Logger.auroLogger(message, "success", section);
  }

  static error(message, section = false) {
    Logger.auroLogger(message, "error", section);
  }
}
