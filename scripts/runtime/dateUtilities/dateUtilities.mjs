import { parseDate, getDateAsString, toNorthAmericanFormat } from "./dateStringUtility.mjs";

/**
 * Compares two dates to see if they match.
 * @param {Object} date1 - First date to compare.
 * @param {Object} date2 - Second date to compare.
 * @returns {Boolean} Returns true if the dates match.
 */
export const datesMatch = (date1, date2) => new Date(date1).getTime() === new Date(date2).getTime();

/**
 * Returns true if value passed in is a valid date (e.g. not February 30th, etc.).
 * @param {String} date - Date to validate.
 * @param {String} format - Date format to validate against.
 * @returns {Boolean}
 */
export const validDateStr = (date, format) => {

  // Guard Clause: Date and format are defined
  if (typeof date === "undefined" || typeof format === "undefined") {
    throw new Error('AuroDatepickerUtilities | validateDateStr: Date and format are required');
  }

  // Guard Clause: Date should be of type string
  if (typeof date !== "string") {
    throw new Error('AuroDatepickerUtilities | validateDateStr: Date must be a string');
  }

  // Guard Clause: Format should be of type string
  if (typeof format !== "string") {
    throw new Error('AuroDatepickerUtilities | validateDateStr: Format must be a string');
  }

  // The length we expect the date string to be
  const dateStrLength = format.length;

  // Guard Clause: Length is what we expect it to be
  if (date.length !== dateStrLength) {
    return false;
  };

  // Get a formatted date string and parse it
  const formattedDate = toNorthAmericanFormat(date, format);
  const parsedDate = Date.parse(formattedDate);

  // Guard Clause: Date parse succeeded
  if (Number.isNaN(parsedDate) || !parsedDate) {
    return false;
  }

  // Generate a date object for the parsed date and the expected date
  const dateObj = new Date(parsedDate);
  const dateStrings = parseDate(date, format);
  const expectedDateStr = `${dateStrings.month}/${dateStrings.day}/${dateStrings.year}`;
  const actualDateStr = getDateAsString(dateObj, "en-US");

  // Guard Clause: Generated date matches date string input
  if (expectedDateStr !== actualDateStr) {
    return false;
  }

  // If we passed all other checks, we can assume the date is valid
  return true;
};
