/**
 * Class for interaction with the DOM.
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

  /**
   * If the locale wasn't set via attribute on `elem`,
   * then use the closest `data-locale` attribute crawling up the DOM tree.
   * If none is found, default to 'en-US'.
   */
  getLocale(elem) {
    let locale = "en-US";

    if (elem.hasAttribute("locale")) {
      locale = elem.getAttribute("locale");
    } else {
      const closestLocaleElement = this.closestWithAttribute(
        elem,
        "data-locale",
      );

      if (closestLocaleElement) {
        locale = closestLocaleElement.getAttribute("data-locale");
      }
    }

    return locale;
  }
}
