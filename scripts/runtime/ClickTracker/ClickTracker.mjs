/**
 * A utility class for tracking clicks inside and outside of a target element.
 * Uses a shared event listener pattern to efficiently handle multiple instances.
 *
 * @class ClickTracker
 * @example
 * const tracker = new ClickTracker({
 *   target: document.querySelector('#my-element'),
 *   onClick: ({ clickLocation }) => console.log(`Clicked ${clickLocation}`),
 *   onInnerClick: (event) => console.log('Inside click', event),
 *   onOuterClick: (event) => console.log('Outside click', event)
 * });
 *
 * // Later, when done tracking
 * tracker.disconnect();
 */
export class ClickTracker {
  #target;
  #onClick;
  #onInnerClick;
  #onOuterClick;

  // Static properties to manage shared event listener
  static #instances = new Set();
  static #listenerAttached = false;

  /**
   * Creates a new ClickTracker instance.
   *
   * @param {Object} options - Configuration options for the click tracker
   * @param {HTMLElement} options.target - The target element to track clicks for (required)
   * @param {Function} [options.onClick] - Callback function called on any click, receives object with clickLocation property
   * @param {Function} [options.onInnerClick] - Callback function called when clicking inside the target element
   * @param {Function} [options.onOuterClick] - Callback function called when clicking outside the target element
   * @throws {Error} Throws an error if target element is not provided
   */
  constructor({ target, onClick, onInnerClick, onOuterClick }) {
    if (!target) throw new Error("ClickHandler: Target element is required");
    this.#target = target;
    this.#onClick = onClick;
    this.#onInnerClick = onInnerClick;
    this.#onOuterClick = onOuterClick;

    // Add this instance to the set
    ClickTracker.#instances.add(this);

    // Attach listener only if not already attached
    if (!ClickTracker.#listenerAttached) {
      document.addEventListener(
        "click",
        ClickTracker.#handleDocumentClick,
        true,
      );
      ClickTracker.#listenerAttached = true;
    }
  }

  /**
   * Checks if a click event occurred inside the target element by examining the event's composed path.
   * Uses composedPath() to handle shadow DOM boundaries correctly.
   *
   * @private
   * @param {Event} event - The click event to check
   * @returns {boolean} True if the click was inside the target element, false otherwise
   */
  #clickWasInside(event) {
    const path = event.composedPath();
    return path.includes(this.#target);
  }

  /**
   * Static method that handles all document clicks for all ClickTracker instances.
   * This shared event listener approach optimizes performance when multiple instances exist.
   *
   * @private
   * @static
   * @param {Event} event - The click event from the document
   */
  // Static method to handle all clicks for all instances
  static #handleDocumentClick = (event) => {
    // Process click for each active instance
    ClickTracker.#instances.forEach((instance) => {
      const clickedInside = instance.#clickWasInside(event);

      // Handle general onclick
      instance.#handleClick(clickedInside);

      // Fire inner/outer click
      if (clickedInside) {
        instance.#handleInsideClick(event);
      } else {
        instance.#handleOutsideClick(event);
      }
    });
  };

  /**
   * Handles the general click callback, providing information about where the click occurred.
   *
   * @private
   * @param {boolean} clickedInside - Whether the click occurred inside the target element
   */
  #handleClick(clickedInside) {
    this.#onClick?.({ clickLocation: clickedInside ? "inside" : "outside" });
  }

  /**
   * Handles clicks that occur inside the target element.
   *
   * @private
   * @param {Event} event - The click event that occurred inside the target
   */
  #handleInsideClick(event) {
    this.#onInnerClick?.(event);
  }

  /**
   * Handles clicks that occur outside the target element.
   *
   * @private
   * @param {Event} event - The click event that occurred outside the target
   */
  #handleOutsideClick(event) {
    this.#onOuterClick?.(event);
  }

  /**
   * Disconnects the ClickTracker instance and cleans up resources.
   * Removes the instance from the active set and removes the shared event listener
   * if no other instances are active.
   *
   * @public
   * @example
   * const tracker = new ClickTracker({ target: element });
   * // ... use tracker
   * tracker.disconnect(); // Clean up when done
   */
  disconnect() {
    // Remove this instance from the set
    ClickTracker.#instances.delete(this);

    // Remove event listener only if no instances remain
    if (ClickTracker.#instances.size === 0 && ClickTracker.#listenerAttached) {
      document.removeEventListener(
        "click",
        ClickTracker.#handleDocumentClick,
        true,
      );
      ClickTracker.#listenerAttached = false;
    }
  }
}
