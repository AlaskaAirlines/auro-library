import { dateFormatter } from './dateFormatters.mjs';
import { AuroDateUtilities } from './dateUtilities.mjs';
export { AuroDateUtilities } from './dateUtilities.mjs';

// Export a class instance
export const dateUtilities = new AuroDateUtilities();

// Export the class instance methods individually
export const {
  datesMatch,
  validDateStr,
  dateAndFormatMatch,
  minDay,
  minMonth,
  minYear,
  maxDay,
  maxMonth,
  maxYear
} = dateUtilities;

export const {
  toNorthAmericanFormat,
  parseDate,
  getDateAsString
} = dateFormatter;
