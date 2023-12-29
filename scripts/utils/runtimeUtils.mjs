// Copyright (c) Alaska Air. All right reserved. Licensed under the Apache-2.0 license
// See LICENSE in the project root for license information.

// ---------------------------------------------------------------------

/* eslint-disable line-comment-position, no-inline-comments, no-confusing-arrow, no-nested-ternary, implicit-arrow-linebreak */

export default class AuroLibraryRuntimeUtils {

  /* eslint-disable jsdoc/require-param */
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
}

