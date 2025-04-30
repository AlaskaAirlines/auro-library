/* eslint-disable no-magic-numbers */
import { AuroDateUtilitiesBase } from "./baseDateUtilities.mjs";
import { dateFormatter } from "./dateFormatter.mjs";

export class AuroDateUtilities extends AuroDateUtilitiesBase {

  /**
   * Returns the current century.
   * @returns {String} The current century.
   */
  getCentury () {
    return String(new Date().getFullYear()).slice(0, 2);
  }

  /**
   * Returns a four digit year.
   * @param {String} year - The year to convert to four digits.
   * @returns {String} The four digit year.
   */
  getFourDigitYear (year) {

    const strYear = String(year).trim();
    return strYear.length <= 2 ? this.getCentury() + strYear : strYear;
  }

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
      const dateParts = dateFormatter.parseDate(date, format);

      // Guard Clause: Date parse succeeded
      if (!dateParts) {
        return false;
      }

      // Create the expected date string based on the date parts
      const expectedDateStr = `${dateParts.month}/${dateParts.day || "01"}/${this.getFourDigitYear(dateParts.year)}`;

      // Generate a date object that we will extract a string date from to compare to the passed in date string
      const dateObj = new Date(this.getFourDigitYear(dateParts.year), dateParts.month - 1, dateParts.day || 1);

      // Get the date string of the date object we created from the string date
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

        // Guard clause: if there is no day in the dateParts, we can ignore this check.
        if (!dateParts.day) {
          return true;
        }

        // Guard clause: ensure day exists.
        if (!day) {
          return false;
        }

        // Convert day to number
        const numDay = Number.parseInt(day, 10);

        // Guard clause: ensure day is a valid integer
        if (Number.isNaN(numDay)) {
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
        const numMonth = Number.parseInt(month, 10);

        // Guard clause: ensure month is a valid integer
        if (Number.isNaN(numMonth)) {
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
      const yearIsValid = (_year) => {

        // Guard clause: ensure year exists.
        if (!_year) {
          return false;
        }

        // Get the full year
        const year = this.getFourDigitYear(_year);

        // Convert year to number
        const numYear = Number.parseInt(year, 10);

        // Guard clause: ensure year is a valid integer
        if (Number.isNaN(numYear)) {
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
