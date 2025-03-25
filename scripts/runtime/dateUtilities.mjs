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
        return parsedDate;
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

      // Define mappings for date components with named capture groups
      const formatPatterns = {
        'yyyy': '(?<year>\\d{4})',
        'mm': '(?<month>\\d{2})',
        'dd': '(?<day>\\d{2})'
      };

      // Escape slashes and replace format components with regex patterns
      let regexPattern = format.replace(/(?:yyyy|mm|dd)/gu, (match) => formatPatterns[match]);
      regexPattern = `^${regexPattern}$`;

      const regex = new RegExp(regexPattern, 'u');
      const match = dateStr.match(regex);

      if (match && match.groups) {
        return {
          year: match.groups.year,
          month: match.groups.month,
          day: match.groups.day
        };
      }

      return undefined;
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
} = dateUtilities;
