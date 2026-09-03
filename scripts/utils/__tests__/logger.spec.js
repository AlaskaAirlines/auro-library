// `Logger` is the only caller of `scripts/utils/ansiColors.mjs` in the
// published tree, and it is imported by nearly every build script a consumer
// runs. These tests cover the wiring between the two -- particularly the
// unrecognised-status path, where `color` stays `undefined` and gets handed
// straight to `hex()`. chalk threw on that input; the replacement does not, and
// a regression would surface as a crash inside an unrelated consumer's build.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "../logger.mjs";

const ESC = "\u001B";
const RESET_COLOR = `${ESC}[39m`;

const COLORS = {
  info: `${ESC}[38;2;0;150;255m`,
  success: `${ESC}[38;2;76;187;23m`,
  error: `${ESC}[38;2;255;0;0m`,
  warn: `${ESC}[38;2;255;165;0m`,
};

const TOP_BORDER =
  "╭ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ──────────────────────────────╮\n";
const BOTTOM_BORDER =
  "\n╰─────────────────────────────── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╯";

/** @type {import('vitest').MockInstance} */
let logSpy;
/** @type {string | undefined} */
let savedForceColor;
/** @type {boolean | undefined} */
let savedIsTTY;

beforeEach(() => {
  savedForceColor = process.env.FORCE_COLOR;
  savedIsTTY = process.stdout.isTTY;

  // ansiColors reads both on every call, so the colored expectations below
  // hold whether or not the suite was invoked from a terminal.
  process.env.FORCE_COLOR = "1";

  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  if (savedForceColor === undefined) {
    delete process.env.FORCE_COLOR;
  } else {
    process.env.FORCE_COLOR = savedForceColor;
  }

  process.stdout.isTTY = savedIsTTY;

  logSpy.mockRestore();
});

/** @returns {string[]} Every argument passed to console.log, in order. */
const logged = () => logSpy.mock.calls.map((call) => call[0]);

describe("Logger", () => {
  describe("status colors", () => {
    it.each([
      ["info", COLORS.info],
      ["success", COLORS.success],
      ["error", COLORS.error],
      ["warn", COLORS.warn],
    ])("colors a %s message", (status, open) => {
      Logger.auroLogger("hello", status);

      expect(logged()).toEqual([`${open}hello${RESET_COLOR}`]);
    });

    it.each([
      ["info", COLORS.info],
      ["success", COLORS.success],
      ["error", COLORS.error],
      ["warn", COLORS.warn],
    ])("routes the %s convenience method to the same color", (status, open) => {
      Logger[status]("hello");

      expect(logged()).toEqual([`${open}hello${RESET_COLOR}`]);
    });
  });

  describe("an unrecognised status", () => {
    // `color` is left undefined, so this exercises hex()'s null-color path.
    it("does not throw", () => {
      expect(() => Logger.auroLogger("hello", "nonsense")).not.toThrow();
    });

    it("logs the message uncolored rather than dropping it", () => {
      Logger.auroLogger("hello", "nonsense");

      expect(logged()).toEqual(["hello"]);
    });

    it("still logs the section borders uncolored", () => {
      Logger.auroLogger("hello", "nonsense", true);

      expect(logged()).toEqual([TOP_BORDER, "hello", BOTTOM_BORDER]);
    });
  });

  describe("a false status", () => {
    it("skips colorizing entirely", () => {
      Logger.auroLogger("hello", false);

      expect(logged()).toEqual(["hello"]);
    });

    it("logs plain borders when sectioned", () => {
      Logger.auroLogger("hello", false, true);

      expect(logged()).toEqual([TOP_BORDER, "hello", BOTTOM_BORDER]);
    });

    it("is what Logger.log uses", () => {
      Logger.log("hello", true);

      expect(logged()).toEqual([TOP_BORDER, "hello", BOTTOM_BORDER]);
    });
  });

  describe("sectioned output", () => {
    it("colors both borders and reopens the style across their newlines", () => {
      // Each border contains a newline, so this is the concatenated-banner case
      // ansiColors is careful about: the top border ends in "\n" and the bottom
      // begins with one.
      Logger.auroLogger("hello", "info", true);

      const open = COLORS.info;

      expect(logged()).toEqual([
        `${open}${TOP_BORDER.trimEnd()}${RESET_COLOR}\n${open}${RESET_COLOR}`,
        `${open}hello${RESET_COLOR}`,
        `${open}${RESET_COLOR}\n${open}${BOTTOM_BORDER.trimStart()}${RESET_COLOR}`,
      ]);
    });

    it("logs only the message when not sectioned", () => {
      Logger.auroLogger("hello", "info", false);

      expect(logged()).toHaveLength(1);
    });
  });

  describe("when color is disabled", () => {
    it("emits no escapes even for a recognised status", () => {
      // Consumers' CI logs go through this path, so a stray escape here shows
      // up as mojibake in every downstream build log.
      process.env.FORCE_COLOR = "0";
      process.stdout.isTTY = false;

      Logger.auroLogger("hello", "info", true);

      expect(logged()).toEqual([TOP_BORDER, "hello", BOTTOM_BORDER]);
    });
  });
});
