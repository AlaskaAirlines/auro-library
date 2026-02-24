// /Users/Eunsun.Mota@alaskaair.com/Documents/workspace/auro-library/scripts/runtime/dateUtilities/test/dateFormatter.test.mjs

import { expect } from "@open-wc/testing";
import { dateFormatter } from "./dateFormatter.mjs";

// Adjust this destructuring if the actual export shape is different,
// e.g., `export function isISOFormat` instead of default export.
const { isISOFormat, stringToDate } = dateFormatter;

describe("isISOFormat", () => {
  it("returns true for a typical valid ISO date", () => {
    // Act
    const result = isISOFormat("2020-01-01");

    // Assert
    expect(result).to.be.true;
  });

  it("returns true for another valid ISO date with different year and month", () => {
    // Act
    const result = isISOFormat("1999-12-31");

    // Assert
    expect(result).to.be.true;
  });

  it("returns true for a leap day formatted as ISO (format only, not actual calendar validation)", () => {
    // Act
    const result = isISOFormat("2020-02-29");

    // Assert
    expect(result).to.be.true;
  });

  it("returns true for earliest four-digit year edge case", () => {
    // Act
    const result = isISOFormat("0000-01-01");

    // Assert
    expect(result).to.be.true;
  });

  it("returns true for high year edge case", () => {
    // Act
    const result = isISOFormat("9999-12-31");

    // Assert
    expect(result).to.be.true;
  });

  it("returns false when using slashes instead of dashes", () => {
    // Act
    const result = isISOFormat("2020/01/01");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when using spaces instead of dashes", () => {
    // Act
    const result = isISOFormat("2020 01 01");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when year is shorter than four digits", () => {
    // Act
    const result = isISOFormat("999-01-01");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when year is longer than four digits", () => {
    // Act
    const result = isISOFormat("02020-01-01");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when month has a single digit", () => {
    // Act
    const result = isISOFormat("2020-1-01");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when day has a single digit", () => {
    // Act
    const result = isISOFormat("2020-01-1");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when month has three digits", () => {
    // Act
    const result = isISOFormat("2020-001-01");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when day has three digits", () => {
    // Act
    const result = isISOFormat("2020-01-001");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when there is trailing time information appended", () => {
    // Act
    const result = isISOFormat("2020-01-01T00:00:00Z");

    // Assert
    expect(result).to.be.false;
  });

  it("does not return false when there is trailing whitespace", () => {
    // Act
    const result = isISOFormat("2020-01-01 ");

    // Assert
    expect(result).not.to.be.false;
  });

  it("does not return false when there is leading whitespace", () => {
    // Act
    const result = isISOFormat(" 2020-01-01");

    // Assert
    expect(result).not.to.be.false;
  });

  it("returns false when there is internal whitespace", () => {
    // Act
    const result = isISOFormat("2020-01- 01");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false for an empty string", () => {
    // Act
    const result = isISOFormat("");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false for a clearly non-date random string", () => {
    // Act
    const result = isISOFormat("not-a-date");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false for numeric-only string of incorrect length", () => {
    // Act
    const result = isISOFormat("20200101");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when year contains non-digit characters", () => {
    // Act
    const result = isISOFormat("20a0-01-01");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when month contains non-digit characters", () => {
    // Act
    const result = isISOFormat("2020-0b-01");

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when day contains non-digit characters", () => {
    // Act
    const result = isISOFormat("2020-01-0c");

    // Assert
    expect(result).to.be.false;
  });

  it('returns false when input is null (coerced to string "null")', () => {
    // Act
    // Note: RegExp#test will coerce null to "null"
    const result = isISOFormat(null);

    // Assert
    expect(result).to.be.false;
  });

  it('returns false when input is undefined (coerced to string "undefined")', () => {
    // Act
    const result = isISOFormat(undefined);

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when input is a number", () => {
    // Act
    const result = isISOFormat(20200101);

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when input is an object", () => {
    // Act
    const result = isISOFormat({ year: 2020, month: 1, day: 1 });

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when input is an array", () => {
    // Act
    const result = isISOFormat([2020, 1, 1]);

    // Assert
    expect(result).to.be.false;
  });

  it("returns false when input is a function", () => {
    // Act
    const result = isISOFormat(() => "2020-01-01");

    // Assert
    expect(result).to.be.false;
  });
});

describe("stringToDate", () => {
  it("returns a Date constructed from ISO string when input is ISO format", () => {
    // Arrange
    const isoStr = "2024-01-15";
    // Act
    const result = stringToDate(isoStr);

    // Assert

    expect(result).to.be.instanceOf(Date);
    expect(result.toISOString().slice(0, 10)).to.equal("2024-01-15");
  });

  it("returns a Date using parseDate result when input is non-ISO format", () => {
    // Arrange
    const inputStr = "15/01/2024";
    const expectedYear = 2024;
    const expectedMonth = 1; // January (1-based)
    const expectedDay = 15;

    // Act
    const result = stringToDate(inputStr, "dd/mm/yyyy");

    // Assert

    expect(result).to.be.instanceOf(Date);
    expect(result.getFullYear()).to.equal(expectedYear);
    expect(result.getMonth()).to.equal(expectedMonth - 1); // JS months are 0-based
    expect(result.getDate()).to.equal(expectedDay);
  });

  it("uses default format parameter when format is not provided", () => {
    // Arrange
    const inputStr = "2024-02-29";
    // Act
    const result = stringToDate(inputStr);

    // Assert

    expect(result).to.be.instanceOf(Date);
    expect(result.getFullYear()).to.equal(2024);
    expect(result.getMonth()).to.equal(1); // 2 - 1
    expect(result.getDate()).to.equal(29);
  });

  it("correctly adjusts month from 1-based to 0-based when creating Date", () => {
    // Arrange
    const inputStr = "2024-12-31";
    // Act
    const result = stringToDate(inputStr);

    // Assert

    expect(result.getFullYear()).to.equal(2024);
    expect(result.getMonth()).to.equal(11); // 12 - 1
    expect(result.getDate()).to.equal(31);
  });

  it("creates Date directly from ISO string for another valid date (coverage for different values)", () => {
    // Arrange
    const isoStr = "1999-12-31";

    // Act
    const result = stringToDate(isoStr);

    expect(result).to.be.instanceOf(Date);
    expect(result.toISOString().slice(0, 10)).to.equal("1999-12-31");
  });
});
