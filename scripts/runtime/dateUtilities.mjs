export class AuroDateUtilities {

  constructor() {

    /**
     * Convert a date object to string format.
     * @param {Object} date - Date to convert to string.
     * @returns {Object} Returns the date as a string.
     */
    this.getDateAsString = (date) => date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    /**
     * Compares two dates to see if they match.
     * @param {Object} date1 - First date to compare.
     * @param {Object} date2 - Second date to compare.
     * @returns {Boolean} Returns true if the dates match.
     */
    this.datesMatch = (date1, date2) => {
      const dDate1 = new Date(date1);
      const dDate2 = new Date(date2);

      const match = dDate1.getTime() === dDate2.getTime();
      if (match) {
        return true;
      }

      // double check, since match can be false even there are same dates but when date's year is less than 1000.
      return dDate1.getFullYear() === dDate2.getFullYear() &&
        dDate1.getMonth() === dDate2.getMonth() &&
        dDate1.getDate() === dDate2.getDate();
    };

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
      const formattedDate = this.toNorthAmericanFormat(date, format);
      const parsedDate = Date.parse(formattedDate);

      // Guard Clause: Date parse succeeded
      if (!parsedDate) {
        return false;
      }

      // Generate a date object for the parsed date and the expected date
      const dateObj = new Date(parsedDate);
      const dateStrings = this.parseDate(date, format);
      const expectedDateStr = `${dateStrings.month}/${dateStrings.day}/${dateStrings.year}`;
      const actualDateStr = this.getDateAsString(dateObj);

      // Guard Clause: Generated date matches date string input
      if (expectedDateStr !== actualDateStr) {
        return false;
      }

      // If we passed all other checks, we can assume the date is valid
      return true;
    };

    /**
     * Converts a date string to a North American date format.
     * @param {String} dateStr - Date to validate.
     * @param {String} format - Date format to validate against.
     * @returns {Boolean}
     */
    this.toNorthAmericanFormat = (dateStr, format) => {
      if (format === 'mm/dd/yyyy') {
        return dateStr;
      }

      const parsedDate = this.parseDate(dateStr, format);

      if (!parsedDate) {
        throw new Error('AuroDatepickerUtilities | toNorthAmericanFormat: Unable to parse date string');
      }

      const { month, day, year } = parsedDate;

      const dateParts = [];
      if (month) {
        dateParts.push(month);
      }

      if (day) {
        dateParts.push(day);
      }

      if (year) {
        dateParts.push(year);
      }

      return dateParts.join('/');
    };

    /**
     * Parses a date string into its components.
     * @param {string} dateStr - Date string to parse.
     * @param {string} format - Date format to parse.
     * @returns {Object|undefined}
     */
    this.parseDate = (dateStr, format = 'mm/dd/yyyy') => {

      // Guard Clause: Date string is defined
      if (!dateStr) {
        return undefined;
      }

      // Assume the separator is a "/" a defined in our code base
      const separator = '/';

      // Get the parts of the date and format
      const valueParts = dateStr.split(separator);
      const formatParts = format.split(separator);

      // Check if the value and format have the correct number of parts
      if (valueParts.length !== formatParts.length) {
        throw new Error('AuroDatepickerUtilities | parseDate: Date string and format length do not match');
      }

      // Holds the result to be returned
      const result = {
        day: undefined,
        month: undefined,
        year: undefined
      };

      // Iterate over the format and value parts and assign them to the result
      formatParts.forEach((formatPart, index) => {

        const valuePart = valueParts[index];

        if (formatPart.toLowerCase().match("m")) {
          result.month = valuePart;
        } else if (formatPart.toLowerCase().match("d")) {
          result.day = valuePart;
        } else if (formatPart.toLowerCase().match("y")) {
          result.year = valuePart;
        }
      });

      // If we found all the parts, return the result
      if (result.day && result.month && result.year) {
        return result;
      }

      // Throw an error to let the dev know we were unable to parse the date string
      throw new Error('AuroDatepickerUtilities | parseDate: Unable to parse date string');
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
        throw new Error('AuroFormValidation | dateFormatMatches: value and format are required');
      }

      // If the lengths are different, they cannot match
      if (value.length !== format.length) {
        return false;
      }

      // Get the parts of the date
      const dateParts = this.parseDate(value, format);

      // Range definitions
      const maxDay = 31;
      const maxMonth = 12;
      const minYear = 1000;
      const maxYear = 9999;

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
        if (numDay < 1 || numDay > maxDay) {
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
        if (numMonth < 1 || numMonth > maxMonth) {
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
      const isInvalid = checks.includes(false);

      //  If the check is invalid, return false
      if (isInvalid) {
        return false;
      }

      // Default case
      return true;
    };
  }
}

// Export a class instance
export const dateUtilities = new AuroDateUtilities();

// Export the class instance methods individually
export const {
  getDateAsString,
  datesMatch,
  validDateStr,
  toNorthAmericanFormat,
  parseDate,
  dateAndFormatMatch
} = dateUtilities;
