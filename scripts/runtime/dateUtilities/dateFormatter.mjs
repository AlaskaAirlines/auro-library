class DateFormatter {
  constructor() {
    /**
     * @description Parses a date string into its components.
     * @param {string} dateStr - Date string to parse.
     * @param {string} format - Date format to parse.
     * @returns {Object<key["month" | "day" | "year"]: number>|undefined}
     */
    this.parseDate = (dateStr, format = "mm/dd/yyyy") => {
      // Guard Clause: Date string is defined
      if (!dateStr) {
        return undefined;
      }

      // Assume the separator is a "/" a defined in our code base
      const separator = "/";

      // Get the parts of the date and format
      const valueParts = dateStr.split(separator);
      const formatParts = format.split(separator);

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

      // If we found at least one part, return the result
      if (result.month || result.day || result.year) {
        return result;
      }

      // Throw an error to let the dev know we were unable to parse the date string
      throw new Error(
        "AuroDatepickerUtilities | parseDate: Unable to parse date string",
      );
    };

    /**
     * Convert a date object to string format.
     * @param {Object} date - Date to convert to string.
     * @param {String} locale - Optional locale to use for the date string. Defaults to user's locale.
     * @returns {String} Returns the date as a string.
     */
    this.getDateAsString = (date, locale = undefined) =>
      date.toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

    /**
     * Converts a date string to a North American date format.
     * @param {String} dateStr - Date to validate.
     * @param {String} format - Date format to validate against.
     * @returns {Boolean}
     */
    this.toNorthAmericanFormat = (dateStr, format) => {
      if (format === "mm/dd/yyyy") {
        return dateStr;
      }

      const parsedDate = this.parseDate(dateStr, format);

      if (!parsedDate) {
        throw new Error(
          "AuroDatepickerUtilities | toNorthAmericanFormat: Unable to parse date string",
        );
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

      return dateParts.join("/");
    };
  }

  /**
   * Determines whether a string is in ISO date format (yyyy-mm-dd).
   * This is used to quickly identify dates that can be directly parsed as ISO strings.
   *
   * @param {string} dateStr - The value to check for ISO date formatting.
   * @returns {boolean} Returns true when the value is a non-empty string in yyyy-mm-dd format, otherwise false.
   */
  isISOFormat(dateStr) {
    if (!dateStr || typeof dateStr !== "string") {
      return false;
    }

    const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
    return isoFormat.test(dateStr.trim());
  }

  /**
   * Converts a date string into a JavaScript Date instance. This method supports ISO formatted strings and other formats that can be parsed by the formatter.
   *
   * @param {String} dateStr - Date string to convert into a Date object.
   * @param {String} format - Date format used to parse the string when it is not in ISO format.
   * @returns {Date|null} Returns a Date instance for valid input or null when the string cannot be parsed.
   */
  stringToDate(dateStr, format = "yyyy-mm-dd") {
    if (this.isISOFormat(dateStr)) {
      return new Date(dateStr + "T00:00:00.000Z"); // Ensure it's treated as ISO
    }

    const parsedDate = this.parseDate(dateStr, format);

    if (!parsedDate) {
      console.debug(
        "AuroDatepickerUtilities | stringToDate: Unable to parse date string",
      );
      return null;
    }

    const { month, day, year } = parsedDate;

    // Months are 0-indexed in JavaScript Date objects, so we need to subtract 1 from the month value
    return new Date(year, month - 1, day);
  }
}

export const dateFormatter = new DateFormatter();
