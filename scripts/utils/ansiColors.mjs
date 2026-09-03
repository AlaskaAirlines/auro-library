// Minimal stand-in for the slice of `chalk` this package used: `hex(color)(text)`
// and `hex(color).bold(text)`.
//
// auro-library is a runtime dependency of nearly every Auro component, so
// anything imported by a published script is installed into every downstream
// project. `chalk` was never actually declared as a dependency -- it only ever
// resolved by accident when a consumer happened to hoist one -- so these two
// helpers replace it rather than shipping a package for four call sites.
//
// Output is byte-identical to chalk for both supported forms, including
// chalk's decision about *when* to emit escapes at all.

const ESC = "\u001B";
const RESET_COLOR = `${ESC}[39m`;
const BOLD_ON = `${ESC}[1m`;
const BOLD_OFF = `${ESC}[22m`;

/**
 * Whether to emit ANSI escapes, following the same precedence chalk uses:
 * FORCE_COLOR wins, then NO_COLOR, then a dumb terminal, then TTY detection.
 * Notably this means piped and CI output is plain text, which is what chalk
 * already did here.
 * @returns {boolean} True when escapes should be emitted.
 */
function colorEnabled() {
  const { FORCE_COLOR, NO_COLOR, TERM } = process.env;

  if (FORCE_COLOR !== undefined) {
    // An explicit `0`/`false` is a force-*off* in chalk's `supports-color`, not
    // an absence of opinion -- it short-circuits ahead of TTY detection, so
    // setting it yields plain text even on a terminal. A set-but-empty value is
    // a force-*on*, which is why this tests the two off values rather than
    // truthiness.
    return FORCE_COLOR !== "0" && FORCE_COLOR !== "false";
  }

  if (NO_COLOR) {
    return false;
  }

  if (TERM === "dumb") {
    return false;
  }

  return Boolean(process.stdout?.isTTY);
}

/**
 * Parse `#rgb` or `#rrggbb` into 8-bit channels.
 * @param {string} hexColor - Hex color string, with or without a leading `#`.
 * @returns {[number, number, number] | null} Channels, or null if unparseable.
 */
function toRgb(hexColor) {
  if (typeof hexColor !== "string") {
    return null;
  }

  const raw = hexColor.replace(/^#/u, "");
  const expanded =
    raw.length === 3
      ? raw
          .split("")
          .map((channel) => channel + channel)
          .join("")
      : raw;

  if (!/^[0-9a-f]{6}$/iu.test(expanded)) {
    return null;
  }

  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
}

/**
 * Build a colorizer for a hex color.
 *
 * Unlike `chalk.hex`, an unparseable or missing color returns the text
 * unchanged instead of throwing -- `Logger.auroLogger` reaches this path
 * whenever it is handed a status it does not recognize.
 * @param {string} hexColor - Hex color string, e.g. `#0096FF`.
 * @returns {((text: string) => string) & {bold: (text: string) => string}} Colorizer with a `.bold` variant.
 */
export function hex(hexColor) {
  const rgb = toRgb(hexColor);

  /**
   * @param {string} text - Text to wrap.
   * @param {boolean} bold - Whether to also apply bold.
   * @returns {string} The wrapped text.
   */
  const paint = (text, bold) => {
    const body = `${text}`;

    // chalk short-circuits empty input rather than emitting a bare open/close
    // pair, and every banner here is built by concatenating segments.
    if (!rgb || body === "" || !colorEnabled()) {
      return body;
    }

    const color = `${ESC}[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
    const open = bold ? `${color}${BOLD_ON}` : color;
    const close = bold ? `${BOLD_OFF}${RESET_COLOR}` : RESET_COLOR;

    // Re-open the style after every line break, the way chalk does, so the
    // color survives anything that processes output line by line. The ASCII
    // banners and the boxed `section` logs all rely on this.
    return `${open}${body.replace(/(\r?\n)/gu, `${close}$1${open}`)}${close}`;
  };

  const colorize = (text) => paint(text, false);

  colorize.bold = (text) => paint(text, true);

  return colorize;
}
