import { DATE_UTIL_CONSTRAINTS } from "./dateConstraints.mjs";

export class AuroDateUtilitiesBase {

  /**
   * @description The maximum day value allowed by the various utilities in this class.
   * @readonly
   * @type {Number}
   */
  get maxDay() {
    return DATE_UTIL_CONSTRAINTS.maxDay;
  }

  /**
   * @description The maximum month value allowed by the various utilities in this class.
   * @readonly
   * @type {Number}
   */
  get maxMonth() {
    return DATE_UTIL_CONSTRAINTS.maxMonth;
  }

  /**
   * @description The maximum year value allowed by the various utilities in this class.
   * @readonly
   * @type {Number}
   */
  get maxYear() {
    return DATE_UTIL_CONSTRAINTS.maxYear;
  }

  /**
   * @description The minimum day value allowed by the various utilities in this class.
   * @readonly
   * @type {Number}
   */
  get minDay() {
    return DATE_UTIL_CONSTRAINTS.minDay;
  }

  /**
   * @description The minimum month value allowed by the various utilities in this class.
   * @readonly
   * @type {Number}
   */
  get minMonth() {
    return DATE_UTIL_CONSTRAINTS.minMonth;
  }

  /**
   * @description The minimum year value allowed by the various utilities in this class.
   * @readonly
   * @type {Number}
   */
  get minYear() {
    return DATE_UTIL_CONSTRAINTS.minYear;
  }
};
