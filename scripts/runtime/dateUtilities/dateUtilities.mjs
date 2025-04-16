import { AuroDateUtilitiesBase } from "./baseDateUtilities.mjs";
import { dateFormatter } from "./dateFormatters.mjs";

export class AuroDateUtilities extends AuroDateUtilitiesBase {

  constructor() {

    super();

    /**
     * Compares two dates to see if they match.
     * @param {Object} date1 - First date to compare.
     * @param {Object} date2 - Second date to compare.
     * @returns {Boolean} Returns true if the dates match.
     */
    this.datesMatch = (date1, date2) => new Date(date1).getTime() === new Date(date2).getTime();

    /**
     * Returns true if value passed in is a valid date.
     * @param {String} date - Date to validate.
     * @param {String} format - Date format to validate against.
     * @returns {Boolean}
     */
    this.validDateStr = (date, format) => {

      // The length we expect the date string to be
      const dateStrLength = format.length;

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

      // Guard Clause: Length is what we expect it to be
      if (date.length !== dateStrLength) {
        return false;
      };

      // Get a formatted date string and parse it
      const formattedDate = dateFormatter.toNorthAmericanFormat(date, format);
      const parsedDate = Date.parse(formattedDate);

      // Guard Clause: Date parse succeeded
      if (!parsedDate) {
        return false;
      }

      // Generate a date object for the parsed date and the expected date
      const dateObj = new Date(parsedDate);
      const dateStrings = dateFormatter.parseDate(date, format);
      const expectedDateStr = `${dateStrings.month}/${dateStrings.day}/${dateStrings.year}`;
      const actualDateStr = dateFormatter.getDateAsString(dateObj);

      // Guard Clause: Generated date matches date string input
      if (expectedDateStr !== actualDateStr) {
        return false;
      }

      // If we passed all other checks, we can assume the date is valid
      return true;
    };

    /**
     * Determines if a string date value matches the format provided.
     * @param {string} value = The date string value.
     * @param { string} format = The date format to match against.
     * @returns {boolean}
     */
    this.dateAndFormatMatch = (value, format) => {

      // Ensure we have both values we need to do the comparison
      if (!value || !format) {
        throw new Error('AuroFormValidation | dateFormatMatch: value and format are required');
      }

      // If the lengths are different, they cannot match
      if (value.length !== format.length) {
        return false;
      }

      // Get the parts of the date
      const dateParts = dateFormatter.parseDate(value, format);

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
        if (numDay < this.minDay || numDay > this.maxDay) {
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
        if (numMonth < this.minMonth || numMonth > this.maxMonth) {
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
        if (numYear < this.minYear || numYear > this.maxYear) {
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
  }
}
