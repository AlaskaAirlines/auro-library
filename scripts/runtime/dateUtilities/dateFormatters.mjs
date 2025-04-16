const dateFormatter = {

  /**
   * Parses a date string into its components.
   * @param {string} dateStr - Date string to parse.
   * @param {string} format - Date format to parse.
   * @returns {Object|undefined}
   */
  parseDate: (dateStr, format = 'mm/dd/yyyy') => {

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
  },

  /**
   * Convert a date object to string format.
   * @param {Object} date - Date to convert to string.
   * @returns {Object} Returns the date as a string.
   */
  getDateAsString: (date) => date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }),

  /**
   * Converts a date string to a North American date format.
   * @param {String} dateStr - Date to validate.
   * @param {String} format - Date format to validate against.
   * @returns {Boolean}
   */
  toNorthAmericanFormat: (dateStr, format) => {

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
  }
};

export { dateFormatter };
