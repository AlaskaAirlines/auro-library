import { expect } from "@open-wc/testing";
import { dateFormatter } from "./dateFormatter.mjs";

describe("dateFormatter.isISOFormat", () => {
  it("returns true for a typical valid ISO date", () => {
    const result = dateFormatter.isISOFormat("2020-01-01");

    expect(result).to.be.true;
  });

  it("returns true for another valid ISO date with different year and month", () => {
    const result = dateFormatter.isISOFormat("1999-12-31");

    expect(result).to.be.true;
  });

  it("returns true for a leap day formatted as ISO (format only, not actual calendar validation)", () => {
    const result = dateFormatter.isISOFormat("2020-02-29");

    expect(result).to.be.true;
  });

  it("returns true for earliest four-digit year edge case", () => {
    const result = dateFormatter.isISOFormat("0000-01-01");

    expect(result).to.be.true;
  });

  it("returns true for high year edge case", () => {
    const result = dateFormatter.isISOFormat("9999-12-31");

    expect(result).to.be.true;
  });

  it("returns false when using slashes instead of dashes", () => {
    const result = dateFormatter.isISOFormat("2020/01/01");

    expect(result).to.be.false;
  });

  it("returns false when using spaces instead of dashes", () => {
    const result = dateFormatter.isISOFormat("2020 01 01");

    expect(result).to.be.false;
  });

  it("returns false when year is shorter than four digits", () => {
    const result = dateFormatter.isISOFormat("999-01-01");

    expect(result).to.be.false;
  });

  it("returns false when year is longer than four digits", () => {
    const result = dateFormatter.isISOFormat("02020-01-01");

    expect(result).to.be.false;
  });

  it("returns false when month has a single digit", () => {
    const result = dateFormatter.isISOFormat("2020-1-01");

    expect(result).to.be.false;
  });

  it("returns false when day has a single digit", () => {
    const result = dateFormatter.isISOFormat("2020-01-1");

    expect(result).to.be.false;
  });

  it("returns false when month has three digits", () => {
    const result = dateFormatter.isISOFormat("2020-001-01");

    expect(result).to.be.false;
  });

  it("returns false when day has three digits", () => {
    const result = dateFormatter.isISOFormat("2020-01-001");

    expect(result).to.be.false;
  });

  it("returns false when there is trailing time information appended", () => {
    const result = dateFormatter.isISOFormat("2020-01-01T00:00:00Z");

    expect(result).to.be.false;
  });

  it("does not return false when there is trailing whitespace", () => {
    const result = dateFormatter.isISOFormat("2020-01-01 ");

    expect(result).not.to.be.false;
  });

  it("does not return false when there is leading whitespace", () => {
    const result = dateFormatter.isISOFormat(" 2020-01-01");

    expect(result).not.to.be.false;
  });

  it("returns false when there is internal whitespace", () => {
    const result = dateFormatter.isISOFormat("2020-01- 01");

    expect(result).to.be.false;
  });

  it("returns false for an empty string", () => {
    const result = dateFormatter.isISOFormat("");

    expect(result).to.be.false;
  });

  it("returns false for a clearly non-date random string", () => {
    const result = dateFormatter.isISOFormat("not-a-date");

    expect(result).to.be.false;
  });

  it("returns false for numeric-only string of incorrect length", () => {
    const result = dateFormatter.isISOFormat("20200101");

    expect(result).to.be.false;
  });

  it("returns false when year contains non-digit characters", () => {
    const result = dateFormatter.isISOFormat("20a0-01-01");

    expect(result).to.be.false;
  });

  it("returns false when month contains non-digit characters", () => {
    const result = dateFormatter.isISOFormat("2020-0b-01");

    expect(result).to.be.false;
  });

  it("returns false when day contains non-digit characters", () => {
    const result = dateFormatter.isISOFormat("2020-01-0c");

    expect(result).to.be.false;
  });

  it('returns false when input is null (coerced to string "null")', () => {
    const result = dateFormatter.isISOFormat(null);

    expect(result).to.be.false;
  });

  it('returns false when input is undefined (coerced to string "undefined")', () => {
    const result = dateFormatter.isISOFormat(undefined);

    expect(result).to.be.false;
  });

  it("returns false when input is a number", () => {
    const result = dateFormatter.isISOFormat(20200101);

    expect(result).to.be.false;
  });

  it("returns false when input is an object", () => {
    const result = dateFormatter.isISOFormat({ year: 2020, month: 1, day: 1 });

    expect(result).to.be.false;
  });

  it("returns false when input is an array", () => {
    const result = dateFormatter.isISOFormat([2020, 1, 1]);

    expect(result).to.be.false;
  });

  it("returns false when input is a function", () => {
    const result = dateFormatter.isISOFormat(() => "2020-01-01");

    expect(result).to.be.false;
  });
});

describe("dateFormatter.stringToDate", () => {
  it("returns a Date constructed from ISO string when input is ISO format", () => {
    const isoStr = "2024-01-15";
    const result = dateFormatter.stringToDate(isoStr);

    expect(result).to.be.instanceOf(Date);
    expect(result.toISOString().slice(0, 10)).to.equal("2024-01-15");
  });

  it("returns a Date using parseDate result when input is non-ISO format", () => {
    const inputStr = "15/01/2024";
    const expectedYear = 2024;
    const expectedMonth = 1; // January (1-based)
    const expectedDay = 15;

    const result = dateFormatter.stringToDate(inputStr, "dd/mm/yyyy");

    expect(result).to.be.instanceOf(Date);
    expect(result.getFullYear()).to.equal(expectedYear);
    expect(result.getMonth()).to.equal(expectedMonth - 1); // JS months are 0-based
    expect(result.getDate()).to.equal(expectedDay);
  });

  it("uses default format parameter when format is not provided", () => {
    const inputStr = "2024-02-29";
    const result = dateFormatter.stringToDate(inputStr);

    expect(result).to.be.instanceOf(Date);
    expect(result.getUTCFullYear()).to.equal(2024);
    expect(result.getUTCMonth()).to.equal(1); // 2 - 1
    expect(result.getUTCDate()).to.equal(29);
  });

  it("correctly adjusts month from 1-based to 0-based when creating Date", () => {
    const inputStr = "2024-12-31";
    const result = dateFormatter.stringToDate(inputStr);

    expect(result.getUTCFullYear()).to.equal(2024);
    expect(result.getUTCMonth()).to.equal(11); // 12 - 1
    expect(result.getUTCDate()).to.equal(31);
  });

  it("creates Date directly from ISO string for another valid date (coverage for different values)", () => {
    const isoStr = "1999-12-31";
    const result = dateFormatter.stringToDate(isoStr);

    expect(result).to.be.instanceOf(Date);
    expect(result.toISOString().slice(0, 10)).to.equal("1999-12-31");
  });
});
