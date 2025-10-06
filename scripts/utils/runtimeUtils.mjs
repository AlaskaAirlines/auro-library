// Copyright (c) Alaska Air. All right reserved. Licensed under the Apache-2.0 license
// See LICENSE in the project root for license information.

// ---------------------------------------------------------------------

/* eslint-disable line-comment-position, no-inline-comments, no-confusing-arrow, no-nested-ternary, implicit-arrow-linebreak */

export default class AuroLibraryRuntimeUtils {

  /* eslint-disable jsdoc/require-param */

  /**
   * This will register a new custom element with the browser.
   * @param {String} name - The name of the custom element.
   * @param {Object} componentClass - The class to register as a custom element.
   * @returns {void}
   */
  registerComponent(name, componentClass) {
    if (!customElements.get(name)) {
      customElements.define(name, class extends componentClass {});
    }
  }

  /**
   * Finds and returns the closest HTML Element based on a selector.
   * @returns {void}
   */
  closestElement(
    selector, // selector like in .closest()
    base = this, // extra functionality to skip a parent
    __Closest = (el, found = el && el.closest(selector)) =>
      !el || el === document || el === window
        ? null // standard .closest() returns null for non-found selectors also
        : found
          ? found // found a selector INside this element
          : __Closest(el.getRootNode().host) // recursion!! break out to parent DOM
  ) {
    return __Closest(base);
  }
  /* eslint-enable jsdoc/require-param */

  /**
   * If the element passed is registered with a different tag name than what is passed in, the tag name is added as an attribute to the element.
   * @param {Object} elem - The element to check.
   * @param {String} tagName - The name of the Auro component to check for or add as an attribute.
   * @returns {void}
   */
  handleComponentTagRename(elem, tagName) {
    const tag = tagName.toLowerCase();
    const elemTag = elem.tagName.toLowerCase();

    if (elemTag !== tag) {
      elem.setAttribute(tag, true);
    }
  }

  /**
   * Validates if an element is a specific Auro component.
   * @param {Object} elem - The element to validate.
   * @param {String} tagName - The name of the Auro component to check against.
   * @returns {Boolean} - Returns true if the element is the specified Auro component.
   */
  elementMatch(elem, tagName) {
    const tag = tagName.toLowerCase();
    const elemTag = elem.tagName.toLowerCase();

    return elemTag === tag || elem.hasAttribute(tag);
  }

  /**
   * Gets the text content of a named slot.
   * @returns {String}
   * @private
   */
  getSlotText(elem, name) {
    const slot = elem.shadowRoot?.querySelector(`slot[name="${name}"]`);
    const nodes = slot?.assignedNodes({ flatten: true }) || [];
    const text = nodes.map(n => n.textContent?.trim()).join(' ').trim();

    return text || null;
  }
}

