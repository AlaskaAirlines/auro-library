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
   * @param {boolean} [controlTabOrder=false] If true enables manual control of the tab order by the FocusTrap.
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

  /**
   * Gets an array of currently active (focused) elements in the document and shadow DOM.
   * @returns {Array<HTMLElement>} An array of focusable elements within the container.
   * @private
   */
  _getActiveElements() {
    // Get the active element(s) in the document and shadow root
    // This will include the active element in the shadow DOM if it exists
    // Active element may be inside the shadow DOM depending on delegatesFocus, so we need to check both
    let {activeElement} = document;
    const actives =  [activeElement];
    while (activeElement?.shadowRoot?.activeElement) {
      actives.push(activeElement.shadowRoot.activeElement);
      activeElement = activeElement.shadowRoot.activeElement;
    }
    return actives;
  }

  /**
   * Gets the next focus index based on the current index and focusable elements.
   * @param {number} currentIndex The current index of the focused element.
   * @param {Array<HTMLElement>} focusables The array of focusable elements.
   * @returns {number|null} The next focus index or null if not determined.
   */
  _getNextFocusIndex(currentIndex, focusables, actives) {
    
    // Determine if we need to wrap
    const atFirst = actives.includes(focusables[0]) || actives.includes(this.container);
    const atLast = actives.includes(focusables[focusables.length - 1]);

    if (this.controlTabOrder) {
      // Calculate the new index based on the current index and tab direction
      let newFocusIndex = currentIndex + (this.tabDirection === 'forward' ? 1 : -1);

      // Wrap-around logic
      if (newFocusIndex < 0) newFocusIndex = focusables.length - 1;
      if (newFocusIndex >= focusables.length) newFocusIndex = 0;

      return newFocusIndex;
    }

    // Only wrap if at the ends
    if (this.tabDirection === 'backward' && atFirst) {
      return focusables.length - 1;
    }

    if (this.tabDirection === 'forward' && atLast) {
      return 0;
    }

    // No wrap, so don't change focus, return early
    return null;
  }

  /**
   * Handles the Tab key press event to manage focus within the container.
   * @param {KeyboardEvent} e The keyboard event triggered by the user.
   * @returns {void}
   */
  _handleTabKey(e) {

    // Update the focusable elements
    const focusables = this._getFocusableElements();

    if (!focusables.length) {
      console.warn('FocusTrap: No focusable elements found in the container.');
      return;
    }

    // Set the tab direction based on the key pressed
    this.tabDirection = e.shiftKey ? 'backward' : 'forward';

    // Get the active elements that are currently focused
    const actives = this._getActiveElements();

    // If we're at either end of the focusable elements, wrap around to the other end
    let focusIndex = focusables.findIndex((el) => actives.includes(el));

    // Fallback if we have no focused element
    if (focusIndex === -1) focusIndex = 0;

    // Get the next focus index based on the current focus index, tab direction, and controlTabOrder setting
    // Is null if no new focus index is determined
    let newFocusIndex = this._getNextFocusIndex(focusIndex, focusables, actives);

    // If we have a new focus index, set focus to that element
    if (newFocusIndex !== null) {
      e.preventDefault();
      focusables[newFocusIndex].focus();
    }
  }

  /**
   * Catches the keydown event
   * @param {KeyboardEvent} e The keyboard event triggered by user interaction.
   * @private
   */
  _onKeydown = (e) => {

    // Handle tab
    if (e.key === 'Tab') this._handleTabKey(e);
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
    
    // Return the elements found
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
