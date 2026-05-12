/**
 * @description Splits a date string into its parts according to the provided format. Does NOT validate that the result is a real calendar date — use `parseDate` when validation is required.
 * @param {string} dateStr - Date string to parse.
 * @param {string} format - Date format to parse.
 * @returns {{ month?: string, day?: string, year?: string }|undefined}
 */
function getDateParts(dateStr, format) {
  if (!dateStr) {
    return undefined;
  }

  const formatSeparatorMatch = format.match(/[/.-]/);
  let valueParts;
  let formatParts;

  if (formatSeparatorMatch) {
    const separator = formatSeparatorMatch[0];
    valueParts = dateStr.split(separator);
    formatParts = format.split(separator);
  } else {
    if (dateStr.match(/[/.-]/)) {
      throw new Error(
        "AuroDatepickerUtilities | parseDate: Date string has no separators",
      );
    }

    if (dateStr.length !== format.length) {
      throw new Error(
        "AuroDatepickerUtilities | parseDate: Date string and format length do not match",
      );
    }

    valueParts = [dateStr];
    formatParts = [format];
  }

  if (valueParts.length !== formatParts.length) {
    throw new Error(
      `AuroDatepickerUtilities | parseDate: Date string and format do not match : ${dateStr} vs ${format}`,
    );
  }

  const result = formatParts.reduce((acc, part, index) => {
    const value = valueParts[index];

    if (/m/iu.test(part) && part.length === value.length) {
      acc.month = value;
    } else if (/d/iu.test(part) && part.length === value.length) {
      acc.day = value;
    } else if (/y/iu.test(part) && part.length === value.length) {
      acc.year = value;
    }

    return acc;
  }, {});

  if (!result.month && !result.day && !result.year) {
    throw new Error(
      "AuroDatepickerUtilities | parseDate: Unable to parse date string",
    );
  }

  return result;
}

function isCalendarDate(year, month, day) {
  let yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);

  if (
    !Number.isInteger(yearNumber) ||
    !Number.isInteger(monthNumber) ||
    !Number.isInteger(dayNumber)
  ) {
    return false;
  }

  // Handle 2-digit years by converting them to 4-digit years based on a cutoff. This allows for parsing of 2-digit year formats while still validating the resulting date.
  if (yearNumber < 100 && yearNumber >= 50) {
    yearNumber += 1900;
  } else if (yearNumber < 50) {
    yearNumber += 2000;
  }

  const stringified = `${String(yearNumber).padStart(4, "0")}-${String(monthNumber).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
  const date = new Date(stringified.replace(/[.-]/g, "/"));

  return (
    !Number.isNaN(date.getTime()) && toISOFormatString(date) === stringified
  );
}

/**
 * @description Parses a date string into its components and validates that the result is a real calendar date. Use `getDateParts` instead when raw splitting without validation is needed (e.g. for in-progress input).
 *
 * Partial formats are supported: components absent from `format` default to `year → "0"`,
 * `month → "01"`, `day → "01"` for calendar validation only. The returned object contains
 * only the fields actually present in the format string — missing fields are never injected.
 * @param {string} dateStr - Date string to parse.
 * @param {string} format - Date format to parse.
 * @returns {{ month?: string, day?: string, year?: string }|undefined}
 * @throws {Error} Throws when the parsed result does not represent a valid calendar date.
 */
function parseDate(dateStr, format = "mm/dd/yyyy") {
  if (!dateStr || !format) {
    return undefined;
  }
  const result = getDateParts(dateStr.trim(), format);

  if (!result) {
    return undefined;
  }

  const lowerFormat = format.toLowerCase();
  const year = lowerFormat.includes("yy") ? result.year : "0";
  const month = lowerFormat.includes("mm") ? result.month : "01";
  const day = lowerFormat.includes("dd") ? result.day : "01";

  if (isCalendarDate(year, month, day)) {
    return result;
  }

  throw new Error(
    `AuroDatepickerUtilities | parseDate: Date string is not a valid date ${JSON.stringify(result)} with format ${format}`,
  );
}

/**
 * Convert a date object to string format.
 * @param {Object} date - Date to convert to string.
 * @param {String} locale - Optional locale to use for the date string. Defaults to user's locale.
 * @returns {String} Returns the date as a string.
 */
function getDateAsString(date, locale = undefined) {
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Converts a date string to a North American date format.
 * @param {String} dateStr - Date to validate.
 * @param {String} format - Date format to validate against.
 * @returns {String}
 */
function toNorthAmericanFormat(dateStr, format) {
  if (format === "mm/dd/yyyy") {
    return dateStr;
  }

  const parsedDate = parseDate(dateStr, format);

  if (!parsedDate) {
    throw new Error(
      "AuroDatepickerUtilities | toNorthAmericanFormat: Unable to parse date string",
    );
  }

  const { month, day, year } = parsedDate;

  return [month, day, year].filter(Boolean).join("/");
}

/**
 * Validates that a date string matches the provided format and represents a real calendar date.
 *
 * @param {string} dateStr - Date string to validate.
 * @param {string} [format="yyyy-mm-dd"] - Format of the date string.
 * @returns {boolean} True when the date string is valid for the provided format, otherwise false.
 */
function isValidDate(dateStr, format = "yyyy-mm-dd") {
  try {
    if (typeof dateStr !== "string" || !dateStr || format?.length < 8) {
      return false;
    }

    if (parseDate(dateStr, format)) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

/**
 * Converts a JavaScript Date instance to a simple ISO-like date string. This returns only the calendar date portion without any time or timezone information.
 *
 * @param {Date} date - Date instance to convert to an ISO-like string.
 * @returns {string} A string in the format "yyyy-mm-dd" representing the provided date.
 * @throws {Error} Throws an error when the input is not a valid Date instance.
 */
function toISOFormatString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error(
      "AuroDatepickerUtilities | toISOFormatString: Input must be a valid Date instance",
    );
  }
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Converts a date string into a JavaScript Date instance. This method supports ISO formatted strings and other formats that can be parsed by the formatter.
 *
 * @param {String} dateStr - Date string to convert into a Date object.
 * @param {String} format - Date format used to parse the string when it is not in ISO format.
 * @returns {Date|null} Returns a Date instance for valid input or null for non-string input.
 * @throws {Error} Throws when parsing fails for non-ISO string input.
 */
function stringToDateInstance(dateStr, format = "yyyy-mm-dd") {
  if (typeof dateStr !== "string") {
    return null;
  }

  const { month, day, year } = parseDate(dateStr, format);
  return new Date(`${year}/${month}/${day}`);
}

export const dateFormatter = {
  parseDate,
  getDateParts,
  getDateAsString,
  toNorthAmericanFormat,
  isValidDate,
  toISOFormatString,
  stringToDateInstance,
};
