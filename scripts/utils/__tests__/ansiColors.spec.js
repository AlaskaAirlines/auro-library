// `scripts/utils/ansiColors.mjs` replaced `chalk` outright, so there is no
// second implementation left in the tree to diff against -- `chalk` is asserted
// out of both dependency lists in build/__tests__/packaging.spec.js. The escape
// sequences below are therefore written out literally rather than derived, and
// were captured from chalk before the swap. If a change here forces one of
// these strings to be edited, the output is no longer byte-identical.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hex } from "../ansiColors.mjs";

const ESC = "\u001B";
const BLUE = `${ESC}[38;2;0;150;255m`; // #0096FF, Logger's info color
const WHITE = `${ESC}[38;2;255;255;255m`;
const RESET_COLOR = `${ESC}[39m`;
const BOLD_ON = `${ESC}[1m`;
const BOLD_OFF = `${ESC}[22m`;

// Read on every call by `colorEnabled()`, so each test can set them directly
// without re-importing the module.
const COLOR_ENV = ["FORCE_COLOR", "NO_COLOR", "TERM"];

/** @type {Record<string, string | undefined>} */
const savedEnv = {};
/** @type {boolean | undefined} */
let savedIsTTY;

beforeEach(() => {
  for (const key of COLOR_ENV) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }

  savedIsTTY = process.stdout.isTTY;

  // Deterministic baseline: escapes off unless a test opts in. Vitest pipes
  // stdout, so isTTY is already falsy, but pinning it keeps these tests from
  // depending on how the suite was invoked.
  process.stdout.isTTY = false;
});

afterEach(() => {
  for (const key of COLOR_ENV) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }

  process.stdout.isTTY = savedIsTTY;
});

describe("hex", () => {
  describe("when color is enabled", () => {
    beforeEach(() => {
      process.env.FORCE_COLOR = "1";
    });

    it("wraps text in a 24-bit foreground color and a color reset", () => {
      expect(hex("#0096FF")("x")).toBe(`${BLUE}x${RESET_COLOR}`);
    });

    it("nests bold inside the color, closing bold first", () => {
      // Order is not symmetric: chalk opens color then bold, and closes bold
      // then color. Swapping either half leaves the styles overlapping.
      expect(hex("#0096FF").bold("x")).toBe(
        `${BLUE}${BOLD_ON}x${BOLD_OFF}${RESET_COLOR}`,
      );
    });

    it("expands three-digit shorthand to full channels", () => {
      // No caller uses shorthand today, so this branch of `toRgb` is otherwise
      // dead code that would rot unnoticed.
      expect(hex("#fff")("x")).toBe(`${WHITE}x${RESET_COLOR}`);
    });

    it("accepts a color with or without the leading hash", () => {
      expect(hex("0096FF")("x")).toBe(hex("#0096FF")("x"));
    });

    it("is case-insensitive", () => {
      expect(hex("#0096ff")("x")).toBe(hex("#0096FF")("x"));
    });

    it("coerces non-string input to a string", () => {
      expect(hex("#0096FF")(42)).toBe(`${BLUE}42${RESET_COLOR}`);
    });

    it("short-circuits empty text instead of emitting a bare style pair", () => {
      // The banners in Logger are built by concatenating segments, so an empty
      // segment must contribute nothing at all.
      expect(hex("#0096FF")("")).toBe("");
      expect(hex("#0096FF").bold("")).toBe("");
    });

    describe("multiline text", () => {
      it("reopens the style after a line feed", () => {
        // Anything that processes output a line at a time -- CI log viewers,
        // `grep` -- otherwise loses the color on every line but the first.
        expect(hex("#0096FF")("a\nb")).toBe(
          `${BLUE}a${RESET_COLOR}\n${BLUE}b${RESET_COLOR}`,
        );
      });

      it("keeps a carriage return outside the reset, like chalk", () => {
        expect(hex("#0096FF")("a\r\nb")).toBe(
          `${BLUE}a${RESET_COLOR}\r\n${BLUE}b${RESET_COLOR}`,
        );
      });

      it("reopens both color and bold after a line feed", () => {
        expect(hex("#0096FF").bold("a\nb")).toBe(
          `${BLUE}${BOLD_ON}a${BOLD_OFF}${RESET_COLOR}\n` +
            `${BLUE}${BOLD_ON}b${BOLD_OFF}${RESET_COLOR}`,
        );
      });

      it("emits a trailing empty style pair for text ending in a newline", () => {
        // Logger's `section` banners end in "\n". chalk produces the same
        // dangling open/close here; it is pinned so a "cleanup" that trims it
        // is recognised as a divergence rather than an improvement.
        expect(hex("#0096FF")("a\n")).toBe(
          `${BLUE}a${RESET_COLOR}\n${BLUE}${RESET_COLOR}`,
        );
      });
    });

    describe("unparseable colors", () => {
      // Deliberate divergence: chalk.hex throws on these. Logger.auroLogger
      // reaches this path whenever it is handed a status it does not
      // recognise, so returning the text unchanged is what keeps a mislabelled
      // log line from taking down the build that emitted it.
      it("returns the text unchanged when the color is undefined", () => {
        expect(hex(undefined)("x")).toBe("x");
        expect(hex(undefined).bold("x")).toBe("x");
      });

      it.each([
        ["a non-hex string", "#zzzzzz"],
        ["the wrong digit count", "#0096F"],
        ["an empty string", ""],
        ["a non-string", 16],
      ])("returns the text unchanged given %s", (_label, color) => {
        expect(hex(color)("x")).toBe("x");
      });
    });
  });

  describe("color detection", () => {
    it("emits escapes when stdout is a TTY", () => {
      process.stdout.isTTY = true;

      expect(hex("#0096FF")("x")).toBe(`${BLUE}x${RESET_COLOR}`);
    });

    it("emits plain text when stdout is piped", () => {
      // Piped and CI output stays plain, which is what chalk already did here.
      expect(hex("#0096FF")("x")).toBe("x");
    });

    it("lets FORCE_COLOR override a piped stdout", () => {
      process.env.FORCE_COLOR = "1";

      expect(hex("#0096FF")("x")).toBe(`${BLUE}x${RESET_COLOR}`);
    });

    it.each([["0"], ["false"]])(
      "treats FORCE_COLOR=%s as a force-off, even on a TTY",
      (value) => {
        process.env.FORCE_COLOR = value;
        process.stdout.isTTY = true;

        expect(hex("#0096FF")("x")).toBe("x");
      },
    );

    it("treats a set-but-empty FORCE_COLOR as a force-on", () => {
      // `supports-color` reads a zero-length FORCE_COLOR as level 1, so an
      // empty value enables escapes rather than being ignored as unset.
      process.env.FORCE_COLOR = "";

      expect(hex("#0096FF")("x")).toBe(`${BLUE}x${RESET_COLOR}`);
    });

    it("honours NO_COLOR on a TTY", () => {
      process.env.NO_COLOR = "1";
      process.stdout.isTTY = true;

      expect(hex("#0096FF")("x")).toBe("x");
    });

    it("ignores an empty NO_COLOR, per the no-color.org spec", () => {
      process.env.NO_COLOR = "";
      process.stdout.isTTY = true;

      expect(hex("#0096FF")("x")).toBe(`${BLUE}x${RESET_COLOR}`);
    });

    it("gives FORCE_COLOR precedence over NO_COLOR", () => {
      process.env.FORCE_COLOR = "1";
      process.env.NO_COLOR = "1";

      expect(hex("#0096FF")("x")).toBe(`${BLUE}x${RESET_COLOR}`);
    });

    it("honours TERM=dumb on a TTY", () => {
      process.env.TERM = "dumb";
      process.stdout.isTTY = true;

      expect(hex("#0096FF")("x")).toBe("x");
    });

    it("gives FORCE_COLOR precedence over TERM=dumb", () => {
      process.env.FORCE_COLOR = "1";
      process.env.TERM = "dumb";

      expect(hex("#0096FF")("x")).toBe(`${BLUE}x${RESET_COLOR}`);
    });
  });
});
