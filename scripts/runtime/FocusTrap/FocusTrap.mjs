import { getFocusableElements } from '../Focusables/Focusables.mjs';

/**
 * FocusTrap manages keyboard focus within a specified container element, ensuring that focus does not leave the container when tabbing.
 * It is commonly used for modal dialogs or overlays to improve accessibility by trapping focus within interactive UI components.
 */
export class FocusTrap {
  /**
   * Creates a new FocusTrap instance for the given container element.
   * Initializes event listeners and prepares the container for focus management.
   *
   * @param {HTMLElement} container The DOM element to trap focus within.
   * @throws {Error} If the provided container is not a valid HTMLElement.
   */
  constructor(container, controlTabOrder = false) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error("FocusTrap requires a valid HTMLElement.");
    }

    this.container = container;
    this.tabDirection = 'forward'; // or 'backward';
    this.controlTabOrder = controlTabOrder;

    this._init();
  }

  /**
   * Initializes the focus trap by setting up event listeners and attributes on the container.
   * Prepares the container for focus management, including support for shadow DOM and inert attributes.
   *
   * @private
   */
  _init() {

    // Add inert attribute to prevent focusing programmatically as well (if supported)
    if ('inert' in HTMLElement.prototype) {
      this.container.inert = false; // Ensure the container isn't inert
      this.container.setAttribute('data-focus-trap-container', true); // Mark for identification
    }

    // Track tab direction
    this.container.addEventListener('keydown', this._onKeydown);
  }

  _getActiveElements() {
    // Get the active element(s) in the document and shadow root
    // This will include the active element in the shadow DOM if it exists
    // Active element may be inside the shadow DOM depending on delegatesFocus, so we need to check both
    let activeElement = document.activeElement;
    const actives =  [activeElement];
    while (activeElement?.shadowRoot?.activeElement) {
      actives.push(activeElement.shadowRoot.activeElement);
      activeElement = activeElement.shadowRoot.activeElement;
    }
    return actives;
  }

  /**
   * Handles keydown events to manage tab navigation within the container.
   * Ensures that focus wraps around when reaching the first or last focusable element.
   *
   * @param {KeyboardEvent} e The keyboard event triggered by user interaction.
   * @private
   */
  _onKeydown = (e) => {
    
    if (e.key === 'Tab') {

      // Update the focusable elements
      const focusables = this._getFocusableElements();

      if (!focusables.length) return;

      // Set the tab direction based on the key pressed
      this.tabDirection = e.shiftKey ? 'backward' : 'forward';

      // Get the active elements that are currently focused
      const actives = this._getActiveElements();

      // If we're at either end of the focusable elements, wrap around to the other end
      let focusIndex = focusables.findIndex((el) => actives.includes(el));

      // Fallback if we have no focused element
      if (focusIndex === -1) focusIndex = 0;

      let newFocusIndex;

      // If controlTabOrder is true, we will manually control the tab order
      if (this.controlTabOrder) {

        // Don't let the browser handle the tabbing
        e.preventDefault();

        // Adjust to new index
        newFocusIndex = focusIndex + (this.tabDirection === 'forward' ? 1 : -1);

        // Wrap if necessary
        if (newFocusIndex < 0 && this.tabDirection === 'backward') newFocusIndex = focusables.length - 1;
        if (newFocusIndex >= focusables.length && this.tabDirection === 'forward') newFocusIndex = 0;
      } else {

        // Wrap backwards
        if ((actives.includes(focusables[0]) || actives.includes(this.container)) && this.tabDirection === 'backward') {
          e.preventDefault();
          newFocusIndex = focusables.length - 1;
        }

        // Wrap forwards
        if (actives.includes(focusables[focusables.length - 1]) && this.tabDirection === 'forward') {
          e.preventDefault();
          newFocusIndex = 0;
        }
      }

      if (newFocusIndex !== null) {
        focusables[newFocusIndex].focus();
      }
    }
  };

  /**
   * Retrieves all focusable elements within the container in DOM order, including those in shadow DOM and slots.
   * Returns a unique, ordered array of elements that can receive focus.
   *
   * @returns {Array<HTMLElement>} An array of focusable elements within the container.
   * @private
   */
  _getFocusableElements() {
    // Use the imported utility function to get focusable elements
    const elements = getFocusableElements(this.container);
    
    // Filter out any elements with the 'focus-bookend' class
    return elements;
  }

  /**
   * Moves focus to the first focusable element within the container.
   * Useful for setting initial focus when activating the focus trap.
   */
  focusFirstElement() {
    const focusables = this._getFocusableElements();
    if (focusables.length) focusables[0].focus();
  }

  /**
   * Moves focus to the last focusable element within the container.
   * Useful for setting focus when deactivating or cycling focus in reverse.
   */
  focusLastElement() {
    const focusables = this._getFocusableElements();
    if (focusables.length) focusables[focusables.length - 1].focus();
  }

  /**
   * Removes event listeners and attributes added by the focus trap.
   * Call this method to clean up when the focus trap is no longer needed.
   */
  disconnect() {

    if (this.container.hasAttribute('data-focus-trap-container')) {
      this.container.removeAttribute('data-focus-trap-container');
    }

    this.container.removeEventListener('keydown', this._onKeydown);
  }
}
