/**
 * Class for generating unique hashes based on the current timestamp.
 * This can be used to create unique identifiers for elements or data within an application,
 * ensuring that each identifier is distinct and can be easily generated without the need
 * for external libraries or complex algorithms.
 */
export class DomHandler {
  /**
   * Walk up the DOM (including Shadow DOM boundaries) to find
   * the closest ancestor with a given attribute.
   *
   * @param {Node} startNode - The node to start from
   * @param {string} attrName - Attribute name to match
   * @returns {Element|null}
   */
  closestWithAttribute(startNode, attrName) {
    let node = startNode;

    while (node) {
      // Only check Elements
      if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute(attrName)) {
        return node;
      }

      // Normal DOM parent
      if (node.parentNode) {
        node = node.parentNode;
        continue;
      }

      // Cross Shadow DOM boundary
      if (node instanceof ShadowRoot) {
        node = node.host;
        continue;
      }

      // If we're inside a shadow tree and parentNode is null
      if (node.getRootNode) {
        const root = node.getRootNode();
        if (root instanceof ShadowRoot) {
          node = root.host;
          continue;
        }
      }

      // Nothing left to traverse
      node = null;
    }

    return null;
  }
}
