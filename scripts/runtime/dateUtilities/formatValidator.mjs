/* eslint-disable wrap-regex, function-paren-newline, dot-location, no-magic-numbers, array-element-newline */

/**
 * @constant {Object} VALID_DATE_FORMAT_PARTS
 * @description Contains valid date format parts for month, day, year, and separator.
 * @property {Array} month - Valid month formats.
 * @property {Array} day - Valid day formats.
 * @property {Array} year - Valid year formats.
 * @property {Array} separator - Valid date separators.
 */
export const VALID_DATE_FORMAT_PARTS = {
  month: ["mm", "m"],
  day: ["dd", "d"],
  year: ["yy", "yyyy"],
  separator: ["/", "-", "."],
};

/**
 * Validates the separator used in the date format.
 * @param {string} format - The date format string.
 * @returns {string} The validated separator.
 */
export const validateFormatSeparator = (format) => {
  // Match anything that's not a number, since anything not a number should be a separator
  const separatorRegex = /[^0-9a-zA-Z]/u;
  const separatorMatch = format.match(separatorRegex);

  // Guard clause: ensure we found a separator
  if (!separatorMatch) {
    throw new Error(
      `AuroLibrary | dateFormatter: No valid separator found in format "${format}". Please use one of: ${VALID_DATE_FORMAT_PARTS.separator.join(", ")}`,
    );
  }

  const [separator] = separatorMatch;

  // Guard clause: ensure the separator was a valid separator
  if (!VALID_DATE_FORMAT_PARTS.separator.includes(separatorMatch[0])) {
    throw new Error(
      `AuroLibrary | dateFormatter: Found invalid date format separator. Please use only one of: ${VALID_DATE_FORMAT_PARTS.separator.join(", ")}`,
    );
  }

  return separator;
};

/**
 * Validates a specific date format part (day, month, or year) from the provided format string.
 * @param {string} format - The date format string.
 * @param {string} separator - The separator used in the format.
 * @param {string} part - The part to validate ('day', 'month', or 'year').
 * @returns {boolean} True if the format part is valid.
 */
export const validateFormatPart = (format, separator, part) => {
  const partRegex = {
    day: /d/u,
    month: /m/u,
    year: /y/u,
  };

  // Extract all matching parts for the given type
  const matchingParts = format
    .split(separator)
    .filter((val) => val.match(partRegex[part]));

  // Guard clause: Ensure only one format for this part exists
  if (matchingParts.length > 1) {
    throw new Error(
      `AuroLibrary | dateFormatter: Found more than one format for ${part} in format string.`,
    );
  }

  // Get the format part
  const [partFormat] = matchingParts;

  // Guard clause: Ensure the format part is valid
  if (!VALID_DATE_FORMAT_PARTS[part].includes(partFormat)) {
    throw new Error(
      `AuroLibrary | dateFormatter: Found invalid ${part} format "${partFormat}". Please use only one of: ${VALID_DATE_FORMAT_PARTS[part].join(", ")}`,
    );
  }

  return true;
};

/**
 * @description Checks the validity of a date format to ensure that it matches values we accept.
 * @method validateFormat
 * @param {string} format - The format for the date.
 * @returns {boolean} Returns true if the format is valid, otherwise throws an error.
 */
export const validateFormat = (format) => {
  // Guard Clause: Ensure the format is defined
  if (!format) {
    throw new Error(
      "AuroDatepickerUtilities | validateFormat: No format provided",
    );
  }

  const separator = validateFormatSeparator(format);

  // Guard Clause: Ensure we found a valid separator
  if (!separator) {
    throw new Error(
      "AuroDatepickerUtilities | validateFormat: No valid separator found in format",
    );
  }

  const results = [
    validateFormatPart(format, separator, "day"),
    validateFormatPart(format, separator, "month"),
    validateFormatPart(format, separator, "year"),
  ];

  // Guard Clause: Ensure all parts are valid
  if (results.includes(false)) {
    return false;
  }

  return true;
};
