import { describe, it, expect } from 'vitest';
import {
  datesMatch,
  validDateStr,
  dateAndFormatMatch,
  minDay,
  minMonth,
  minYear,
  maxDay,
  maxMonth,
  maxYear,
  toNorthAmericanFormat,
  parseDate,
  getDateAsString
} from '../index.mjs';

describe('AuroDateUtilities', () => {
  describe('datesMatch', () => {
    it('returns true for matching dates', () => {
      expect(datesMatch('2024-06-01', '2024-06-01')).toBe(true);
      expect(datesMatch(new Date('2024-06-01'), new Date('2024-06-01'))).toBe(true);
    });

    it('returns false for non-matching dates', () => {
      expect(datesMatch('2024-06-01', '2024-06-02')).toBe(false);
    });
  });

  describe('validDateStr', () => {
    it('throws if date is missing', () => {
      expect(() => validDateStr(undefined, "mm/dd/yyyy")).toThrow('AuroDatepickerUtilities | validateDateStr: Date and format are required');
    });

    it('throws if format is missing', () => {
      expect(() => validDateStr('06/01/2024', undefined)).toThrow('AuroDatepickerUtilities | validateDateStr: Date and format are required');
    });

    it('throws if date is not a string', () => {
      expect(() => validDateStr(12345, 'mm/dd/yyyy')).toThrow('AuroDatepickerUtilities | validateDateStr: Date must be a string');
    });

    it('throws if format is not a string', () => {
      expect(() => validDateStr('06/01/2024', 12345)).toThrow('AuroDatepickerUtilities | validateDateStr: Format must be a string');
    });

    it('returns true for valid date strings', () => {
      expect(validDateStr('06/01/2024', 'mm/dd/yyyy')).toBe(true);
    });

    it('returns false for invalid date strings', () => {
      expect(validDateStr('02/30/2024', 'mm/dd/yyyy')).toBe(false);
    });
  });

  describe('dateAndFormatMatch', () => {
    it('returns true for valid date and format', () => {
      expect(dateAndFormatMatch('06/01/2024', 'mm/dd/yyyy')).toBe(true);
      expect(dateAndFormatMatch('1/1/2024', 'm/d/yyyy')).toBe(true);
    });

    it('returns false for out-of-range values', () => {
      expect(dateAndFormatMatch('13/01/2024', 'mm/dd/yyyy')).toBe(false);
      expect(dateAndFormatMatch('06/32/2024', 'mm/dd/yyyy')).toBe(false);
      expect(dateAndFormatMatch('06/01/1899', 'mm/dd/yyyy')).toBe(false);
      expect(dateAndFormatMatch('06/01/2500', 'mm/dd/yyyy')).toBe(false);
    });

    it('returns false for wrong format', () => {
      expect(dateAndFormatMatch('2024-06-01', 'mm/dd/yyyy')).toBe(false);
    });

    it('throws for missing arguments', () => {
      expect(() => dateAndFormatMatch(undefined, 'mm/dd/yyyy')).toThrow();
      expect(() => dateAndFormatMatch('06/01/2024', undefined)).toThrow();
    });
  });

  describe('toNorthAmericanFormat', () => {
    it('converts various formats to mm/dd/yyyy', () => {
      expect(toNorthAmericanFormat('2024-06-01', 'yyyy-mm-dd')).toBe('06/01/2024');
      expect(toNorthAmericanFormat('1.6.2024', 'd.m.yyyy')).toBe('06/01/2024');
      expect(toNorthAmericanFormat('06/01/2024', 'mm/dd/yyyy')).toBe('06/01/2024');
    });
  });

  describe('parseDate', () => {
    it('parses mm/dd/yyyy', () => {
      expect(parseDate('06/01/2024', 'mm/dd/yyyy')).toEqual({ month: '06', day: '01', year: '2024' });
    });

    it('parses m/d/yyyy', () => {
      expect(parseDate('6/1/2024', 'm/d/yyyy')).toEqual({ month: '6', day: '1', year: '2024' });
    });

    it('throws for mismatched format', () => {
      expect(() => parseDate('2024-06-01', 'mm/dd/yyyy')).toThrow();
    });

    it('returns undefined for empty string', () => {
      expect(parseDate('', 'mm/dd/yyyy')).toBeUndefined();
    });
  });

  describe('getDateAsString', () => {
    it('formats date as string in en-US', () => {
      const date = new Date(2024, 5, 1); // June 1, 2024
      expect(getDateAsString(date, 'en-US')).toBe('06/01/2024');
    });

    it('formats date as string in other locales', () => {
      const date = new Date(2024, 5, 1);
      expect(getDateAsString(date, 'en-GB')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('min/max values', () => {
    it('exposes constraint min/max values', () => {
      expect(minDay).toBeDefined();
      expect(maxDay).toBeDefined();
      expect(minMonth).toBeDefined();
      expect(maxMonth).toBeDefined();
      expect(minYear).toBeDefined();
      expect(maxYear).toBeDefined();
    });
  });
});
