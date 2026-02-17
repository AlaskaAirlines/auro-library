/**
 * Class for generating unique hashes based on the current timestamp.
 * This can be used to create unique identifiers for elements or data within an application,
 * ensuring that each identifier is distinct and can be easily generated without the need
 * for external libraries or complex algorithms.
 */
export class UniqueId {
  /**
   * Creates a unique hash based on the current timestamp.
   * @returns {Function} Timestamp as a base-36 string
   */
  create() {
    return Date.now().toString(36);
  }
}
