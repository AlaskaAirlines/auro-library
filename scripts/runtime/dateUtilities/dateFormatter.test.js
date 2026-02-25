import { expect } from "@open-wc/testing";
import { dateFormatter } from "./dateFormatter.mjs";

describe("dateFormatter.isISOFormattedDate", () => {
  describe("valid ISO date strings", () => {
    const validCases = [
      { param: "2020-01-01", description: "typical ISO date" },
      { param: "1999-12-31", description: "end of year ISO date" },
      { param: "2020-02-29", description: "leap day" },
      { param: "0000-01-01", description: "earliest 4-digit year" },
      { param: "2020-01-01 ", description: "trailing whitespace" },
      { param: " 2020-01-01", description: "leading whitespace" },
      { param: "9999-12-31", description: "latest 4-digit year" },
    ];

    validCases.forEach(({ param, description }) => {
      it(`returns true for: ${description}`, () => {
        const result = dateFormatter.isISOFormattedDate(param);
        expect(result, `Expected "${String(param)}" to be valid ISO format`).to
          .be.true;
      });
    });
  });

  describe("non-ISO or invalid ISO date strings and non-string inputs", () => {
    const invalidCases = [
      { param: "2020/01/01", description: "slashes" },
      { param: "2020 01 01", description: "spaces" },
      { param: "999-01-01", description: "short year" },
      { param: "02020-01-01", description: "long year" },
      { param: "2020-1-01", description: "single digit month" },
      { param: "2020-01-1", description: "single digit day" },
      { param: "2020-001-01", description: "3 digit month" },
      { param: "2020-01-001", description: "3 digit day" },
      { param: "2020-01-01T00:00:00Z", description: "trailing time" },
      { param: "2020-01- 01", description: "internal whitespace" },
      { param: "", description: "empty string" },
      { param: "not-a-date", description: "random string" },
      { param: "20200101", description: "numeric only, wrong format" },
      { param: "20a0-01-01", description: "non-digit in year" },
      { param: "2020-0b-01", description: "non-digit in month" },
      { param: "2020-01-0c", description: "non-digit in day" },
      { param: "2020-01-32", description: "invalid day" },
      { param: null, description: "null input" },
      { param: undefined, description: "undefined input" },
      { param: 20200101, description: "number input" },
      {
        param: { year: 2020, month: 1, day: 1 },
        description: "plain object input",
      },
      { param: [2020, 1, 1], description: "array input" },
      { param: () => "2020-01-01", description: "function input" },
    ];

    invalidCases.forEach(({ param, description }) => {
      it(`returns false for: ${description}`, () => {
        const result = dateFormatter.isISOFormattedDate(param);
        expect(result, `Expected "${String(param)}" to be invalid ISO format`)
          .to.be.false;
      });
    });
  });
});

describe("dateFormatter.stringToDateInstance", () => {
  describe("ISO input", () => {
    const isoCases = [
      { input: "2024-01-15", description: "typical ISO date" },
      { input: "1999-12-31", description: "end of year ISO date" },
    ];

    isoCases.forEach(({ input, description }) => {
      it(`creates Date directly from ISO string for: ${description}`, () => {
        const result = dateFormatter.stringToDateInstance(input);

        expect(result).to.be.instanceOf(Date);
        expect(result.toISOString().slice(0, 10)).to.equal(input);
      });
    });
  });

  describe("non-ISO input with explicit format", () => {
    it("returns a Date using parseDate result for dd/mm/yyyy format", () => {
      const inputStr = "15/01/2024";
      const expectedYear = 2024;
      const expectedMonth = 1; // January (1-based)
      const expectedDay = 15;

      const result = dateFormatter.stringToDateInstance(inputStr, "dd/mm/yyyy");

      expect(result).to.be.instanceOf(Date);
      expect(result.getFullYear()).to.equal(expectedYear);
      expect(result.getMonth()).to.equal(expectedMonth - 1);
      expect(result.getDate()).to.equal(expectedDay);
    });
  });

  describe("default format behaviour", () => {
    it("uses default format parameter when format is not provided", () => {
      const inputStr = "2024-02-29";

      const result = dateFormatter.stringToDateInstance(inputStr);

      expect(result).to.be.instanceOf(Date);
      expect(result.getFullYear()).to.equal(2024);
      expect(result.getMonth()).to.equal(1);
      expect(result.getDate()).to.equal(29);
    });
  });

  describe("month adjustment", () => {
    it("correctly adjusts month from 1-based to 0-based when creating Date", () => {
      const inputStr = "2024-12-31";

      const result = dateFormatter.stringToDateInstance(inputStr);

      expect(result.getFullYear()).to.equal(2024);
      expect(result.getMonth()).to.equal(11);
      expect(result.getDate()).to.equal(31);
    });
  });
});

describe("dateFormatter.isValidDate", () => {
  describe("valid date inputs", () => {
    const validCases = [
      {
        args: ["2024-02-29"],
        description: "valid leap day ISO (default format)",
      },
      {
        args: ["1999-12-31", "yyyy-mm-dd"],
        description: "valid ISO with explicit format",
      },
      {
        args: ["12/31/1999", "mm/dd/yyyy"],
        description: "valid mm/dd/yyyy",
      },
      {
        args: ["31-01-2020", "dd-mm-yyyy"],
        description: "valid dd-mm-yyyy",
      },
    ];

    validCases.forEach(({ args, description }) => {
      it(`returns true for: ${description}`, () => {
        const result = dateFormatter.isValidDate(...args);
        expect(result, `Expected ${JSON.stringify(args)} to be a valid date`).to
          .be.true;
      });
    });
  });

  describe("invalid date inputs", () => {
    const invalidCases = [
      {
        args: ["02/2024", "mm/yyyy"],
        description: "short format mm/yyyy",
      },
      {
        args: ["2024/02", "yyyy/mm"],
        description: "short format yyyy/mm",
      },
      {
        args: ["2024", "yyyy"],
        description: "short format yyyy",
      },
      { args: ["2024-02-30"], description: "invalid ISO day" },
      {
        args: ["12/31/1999", "yyyy-mm-dd"],
        description: "non-ISO string with yyyy-mm-dd format",
      },
      {
        args: ["02/30/2024", "mm/dd/yyyy"],
        description: "invalid mm/dd/yyyy with impossible day",
      },
      {
        args: [null, "mm/dd/yyyy"],
        description: "non-string date value",
      },
      {
        args: ["13/2024", "mm/yyyy"],
        description: "invalid mm/yyyy with month out of range",
      },
      {
        args: ["00/24", "mm/yy"],
        description: "invalid mm/yy with month below range",
      },
      {
        args: ["02/24", "mm/yy"],
        description: "invalid mm/yy",
      },
      {
        args: ["2024/13", "yyyy/mm"],
        description: "invalid yyyy/mm with month out of range",
      },
      {
        args: ["ab24", "yyyy"],
        description: "invalid yyyy with non-numeric value",
      },
      {
        args: ["2a", "yy"],
        description: "invalid yy with non-numeric value",
      },
      {
        args: ["24", "yy"],
        description: "invalid yy",
      },
      {
        args: ["00", "mm"],
        description: "invalid mm below range",
      },
      {
        args: ["12", "mm"],
        description: "invalid mm",
      },
      {
        args: ["00", "dd"],
        description: "invalid dd below range",
      },
      {
        args: ["31", "dd"],
        description: "invalid dd",
      },
      {
        args: ["32", "dd"],
        description: "invalid dd above range",
      },
    ];

    invalidCases.forEach(({ args, description }) => {
      it(`returns false for: ${description}`, () => {
        const result = dateFormatter.isValidDate(...args);
        expect(result, `Expected ${JSON.stringify(args)} to be an invalid date`)
          .to.be.false;
      });
    });
  });
});
