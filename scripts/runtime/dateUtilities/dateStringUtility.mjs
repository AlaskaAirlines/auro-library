/* eslint-disable wrap-regex, function-paren-newline, dot-location, no-magic-numbers, no-use-before-define, require-unicode-regexp */

import { maxDay, maxMonth, maxYear, minDay, minMonth, minYear } from "./dateConstraints.mjs";
import { validateFormatSeparator } from "./formatValidator.mjs";

/**
 * Convert a date object to string format.
 * @param {Object} date - Date to convert to string.
 * @param {string} [locale=undefined] - Optional locale to format the date.
 * @returns {Object} Returns the date as a string.
 */
export const getDateAsString = (date, locale = undefined) => date.toLocaleDateString(locale, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * @description Parses a date string into its components.
 * @param {string} dateStr - Date string to parse.
 * @param {string} format - Date format to parse.
 * @param {boolean} [checkFormat=true] - Whether to check if the date string matches the format.
 * @returns {Object<key["month" | "day" | "year"]: number>|undefined}
 */
export const parseDate = (dateStr, format = "mm/dd/yyyy", checkFormat = true) => {
  // Guard Clause: Date string is defined
  if (!dateStr) {
    return undefined;
  }

  // Guard Clause: Date and format match
  if (checkFormat && !dateAndFormatMatch(dateStr, format)) {
    throw new Error(
      "AuroDatepickerUtilities | parseDate: Invalid date format",
    );
  }

  // Assume the separator is a "/" a defined in our code base
  const dateSeparator = validateFormatSeparator(dateStr);
  const formatSeparator = validateFormatSeparator(format);

  // Get the parts of the date and format
  const valueParts = dateStr.split(dateSeparator);
  const formatParts = format.split(formatSeparator);

  // Check if the value and format have the correct number of parts
  if (valueParts.length !== formatParts.length) {
    throw new Error(
      "AuroDatepickerUtilities | parseDate: Date string and format length do not match",
    );
  }

  // Holds the result to be returned
  const result = formatParts.reduce((acc, part, index) => {
    const value = valueParts[index];

    if (/m/iu.test(part)) {
      acc.month = value;
    } else if (/d/iu.test(part)) {
      acc.day = value;
    } else if (/y/iu.test(part)) {
      acc.year = value;
    }

    return acc;
  }, {});

  // If we found all the parts, return the result
  if (result.day && result.month && result.year) {
    return result;
  }

  // Throw an error to let the dev know we were unable to parse the date string
  throw new Error(
    "AuroDatepickerUtilities | parseDate: Unable to parse date string",
  );
};

/**
 * Determines if a string date value matches the format provided.
 * @param {string} value = The date string value.
 * @param { string} format = The date format to match against.
 * @returns {boolean}
 */
export const dateAndFormatMatch = (value, format) => {

  // Ensure we have both values we need to do the comparison
  if (typeof value !== "string" || typeof format !== "string") {
    throw new Error('AuroFormValidation | dateFormatMatch: value and format are required');
  }

  // If the lengths are different, they cannot match
  if (value.length !== format.length) {
    return false;
  }

  // Get the parts of the date
  const dateParts = parseDate(value, format, false);

  // Validator for day
  const dayValueIsValid = (day) => {

    // Guard clause: ensure day exists.
    if (!day) {
      return false;
    }

    // Convert day to number
    const numDay = parseInt(day, 10);

    // Guard clause: ensure day is a valid integer
    if (isNaN(numDay)) {
      throw new Error('AuroDatepickerUtilities | dayValueIsValid: Unable to parse day value integer');
    }

    // Guard clause: ensure day is within the valid range
    if (numDay < minDay || numDay > maxDay) {
      return false;
    }

    // Default return
    return true;
  };

  // Validator for month
  const monthValueIsValid = (month) => {

    // Guard clause: ensure month exists.
    if (!month) {
      return false;
    }

    // Convert month to number
    const numMonth = parseInt(month, 10);

    // Guard clause: ensure month is a valid integer
    if (isNaN(numMonth)) {
      throw new Error('AuroDatepickerUtilities | monthValueIsValid: Unable to parse month value integer');
    }

    // Guard clause: ensure month is within the valid range
    if (numMonth < minMonth || numMonth > maxMonth) {
      return false;
    }

    // Default return
    return true;
  };

  // Validator for year
  const yearIsValid = (year) => {

    // Guard clause: ensure year exists.
    if (!year) {
      return false;
    }

    // Convert year to number
    const numYear = parseInt(year, 10);

    // Guard clause: ensure year is a valid integer
    if (isNaN(numYear)) {
      throw new Error('AuroDatepickerUtilities | yearValueIsValid: Unable to parse year value integer');
    }

    // Guard clause: ensure year is within the valid range
    if (numYear < minYear || numYear > maxYear) {
      return false;
    }

    // Default return
    return true;
  };

  // Self-contained checks for month, day, and year
  const checks = [
    monthValueIsValid(dateParts.month),
    dayValueIsValid(dateParts.day),
    yearIsValid(dateParts.year)
  ];

  // If any of the checks failed, the date format does not match and the result is invalid
  const isValid = checks.every((check) => check === true);

  //  If the check is invalid, return false
  if (!isValid) {
    return false;
  }

  // Default case
  return true;
};

/**
 * Converts a date string from one format to another.
 * @param {String} dateStr - The date string to convert.
 * @param {String} currentFormat - The current format of the date string.
 * @param {String} targetFormat - The desired target format for the date string.
 * @returns {String} The date string in the target format.
 */
export const convertDateFormat = (dateStr, currentFormat, targetFormat) => {
  // Parse the date string using the current format
  const parsedDate = parseDate(dateStr, currentFormat);

  if (Number.isNaN(parsedDate) || !parsedDate) {
    throw new Error(
      "AuroDatepickerUtilities | convertDateFormat: Unable to parse date string",
    );
  }

  const { month, day, year } = parsedDate;

  // Replace the target format placeholders with the parsed values
  const withPlaceholders = targetFormat
    .replace(/yyyy/g, '{{YEAR}}')
    .replace(/yy/g, '{{YEAR_SHORT}}')
    .replace(/mm/g, '{{MONTH}}')
    .replace(/m/g, '{{MONTH_SHORT}}')
    .replace(/dd/g, '{{DAY}}')
    .replace(/d/g, '{{DAY_SHORT}}');

  // Now replace placeholders with actual values
  const formattedDate = withPlaceholders
    .replace(/{{YEAR}}/g, year)
    .replace(/{{YEAR_SHORT}}/g, year.toString().substr(2, 2))
    .replace(/{{MONTH}}/g, month.padStart(2, "0"))
    .replace(/{{MONTH_SHORT}}/g, month)
    .replace(/{{DAY}}/g, day.padStart(2, "0"))
    .replace(/{{DAY_SHORT}}/g, day);

  return formattedDate;
};

/**
 * Converts a date string to a North American date format.
 * @param {String} dateStr - Date to validate.
 * @param {String} format - Date format to validate against.
 * @returns {Boolean}
 */
export const toNorthAmericanFormat = (dateStr, format) => convertDateFormat(dateStr, format, "mm/dd/yyyy");
