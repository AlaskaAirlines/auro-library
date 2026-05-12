import { expect } from "@open-wc/testing";
import { AuroDateUtilities } from "./dateUtilities.mjs";

const utils = new AuroDateUtilities();

describe("AuroDateUtilities.validDateStr", () => {
  it("throws when date is undefined", () => {
    expect(() => utils.validDateStr(undefined, "mm/dd/yyyy")).to.throw(Error);
  });

  it("throws when format is undefined", () => {
    expect(() => utils.validDateStr("01/15/2024", undefined)).to.throw(Error);
  });

  it("throws when date is not a string", () => {
    expect(() => utils.validDateStr(20240115, "mm/dd/yyyy")).to.throw(Error);
  });

  it("returns false when date length does not match format length", () => {
    expect(utils.validDateStr("01/15", "mm/dd/yyyy")).to.be.false;
  });

  it("returns true for a valid date matching its format", () => {
    expect(utils.validDateStr("01/15/2024", "mm/dd/yyyy")).to.be.true;
  });

  it("returns false for an invalid calendar date (Feb 30)", () => {
    expect(utils.validDateStr("02/30/2024", "mm/dd/yyyy")).to.be.false;
  });
});

describe("AuroDateUtilities.dateAndFormatMatch", () => {
  it("throws when value is falsy", () => {
    expect(() => utils.dateAndFormatMatch(null, "mm/dd/yyyy")).to.throw(Error);
  });

  it("throws when format is falsy", () => {
    expect(() => utils.dateAndFormatMatch("01/15/2024", null)).to.throw(Error);
  });

  it("returns false when value length differs from format length", () => {
    expect(utils.dateAndFormatMatch("01/15", "mm/dd/yyyy")).to.be.false;
  });

  it("returns true for a value that matches the format", () => {
    expect(utils.dateAndFormatMatch("01/15/2024", "mm/dd/yyyy")).to.be.true;
  });

  it("returns false when month is below range", () => {
    expect(utils.dateAndFormatMatch("00/15/2024", "mm/dd/yyyy")).to.be.false;
  });

  it("returns false when month is above range", () => {
    expect(utils.dateAndFormatMatch("13/15/2024", "mm/dd/yyyy")).to.be.false;
  });

  it("returns false when day is below range", () => {
    expect(utils.dateAndFormatMatch("01/00/2024", "mm/dd/yyyy")).to.be.false;
  });

  it("returns false when day is above range", () => {
    expect(utils.dateAndFormatMatch("01/32/2024", "mm/dd/yyyy")).to.be.false;
  });

  it("returns false when year is below range", () => {
    expect(utils.dateAndFormatMatch("01/15/1899", "mm/dd/yyyy")).to.be.false;
  });

  it("returns false when year is above range", () => {
    expect(utils.dateAndFormatMatch("01/15/2401", "mm/dd/yyyy")).to.be.false;
  });

  it("skips day check when format has no day component", () => {
    expect(utils.dateAndFormatMatch("01/2024", "mm/yyyy")).to.be.true;
  });

  it("skips month check when format has no month component", () => {
    expect(utils.dateAndFormatMatch("15/2024", "dd/yyyy")).to.be.true;
  });
});
