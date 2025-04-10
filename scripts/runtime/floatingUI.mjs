/* eslint-disable line-comment-position, no-inline-comments */

import { autoUpdate, computePosition, offset, autoPlacement, flip } from '@floating-ui/dom';


const MAX_CONFIGURATION_COUNT = 10;
let isMousePressed = false;

function mouseEventGlobalHandler(event) {
  isMousePressed = event.type === 'mousedown';
}

window.addEventListener('mousedown', mouseEventGlobalHandler);
window.addEventListener('mouseup', mouseEventGlobalHandler);

export default class AuroFloatingUI {
  constructor(element, behavior) {
    this.element = element;
    this.behavior = behavior;

    // Store event listener references for cleanup
    this.focusHandler = null;
    this.clickHandler = null;
    this.keyDownHandler = null;

    /**
     * @private
     */
    this.configureTrial = 0;

    /**
     * @private
     */
    this.eventPrefix = undefined;

    /**
     * @private
     */
    this.id = undefined;

    /**
     * @private
     */
    this.showing = false;

    /**
     * @private
     */
    this.strategy = undefined;
  }

  /**
   * Mirrors the size of the bibSizer element to the bib content.
   * Copies the width, height, max-width, and max-height styles from the bibSizer element to the bib content container.
   * This ensures that the bib content has the same dimensions as the sizer element.
   */
  mirrorSize() {
    // mirror the boxsize from bibSizer
    if (this.element.bibSizer) {
      const sizerStyle = window.getComputedStyle(this.element.bibSizer);
      const bibContent = this.element.bib.shadowRoot.querySelector(".container");
      if (sizerStyle.width !== '0px') {
        bibContent.style.width = sizerStyle.width;
      }
      if (sizerStyle.height !== '0px') {
        bibContent.style.height = sizerStyle.height;
      }
      bibContent.style.maxWidth = sizerStyle.maxWidth;
      bibContent.style.maxHeight = sizerStyle.maxHeight;
    }
  }

  /**
   * @private
   * Determines the positioning strategy based on the current viewport size and mobile breakpoint.
   *
   * This method checks if the current viewport width is less than or equal to the specified mobile fullscreen breakpoint
   * defined in the bib element. If it is, the strategy is set to 'fullscreen'; otherwise, it defaults to 'floating'.
   *
   * @returns {String} The positioning strategy, one of 'fullscreen', 'floating', 'cover'.
   */
  getPositioningStrategy() {
    const breakpoint = this.element.bib.mobileFullscreenBreakpoint || this.element.floaterConfig?.fullscreenBreakpoint;
    switch (this.behavior) {
      case "tooltip":
        return "floating";
      case "dialog":
      case "drawer":
        if (breakpoint) {
          const smallerThanBreakpoint = window.matchMedia(`(max-width: ${breakpoint})`).matches;

          this.element.expanded = smallerThanBreakpoint;
        }
        if (this.element.nested) {
          return "cover";
        }
        return 'fullscreen';
      case "dropdown":
      case undefined:
      case null:
        if (breakpoint) {
          const smallerThanBreakpoint = window.matchMedia(`(max-width: ${breakpoint})`).matches;
          if (smallerThanBreakpoint) {
            return 'fullscreen';
          }
        }
        return "floating";
      default:
        return this.behavior;
    }
  }

  /**
   * @private
   * Positions the bib element based on the current configuration and positioning strategy.
   *
   * This method determines the appropriate positioning strategy (fullscreen or not) and configures the bib accordingly.
   * It also sets up middleware for the floater configuration, computes the position of the bib relative to the trigger element,
   * and applies the calculated position to the bib's style.
   */
  position() {
    const strategy = this.getPositioningStrategy();
    this.configureBibStrategy(strategy);

    if (strategy === 'floating') {
      this.mirrorSize();
      // Define the middlware for the floater configuration
      const middleware = [
        offset(this.element.floaterConfig?.offset || 0),
        ...this.element.floaterConfig?.flip ? [flip()] : [], // Add flip middleware if flip is enabled.
        ...this.element.floaterConfig?.autoPlacement ? [autoPlacement()] : [], // Add autoPlacement middleware if autoPlacement is enabled.
      ];

      // Compute the position of the bib
      computePosition(this.element.trigger, this.element.bib, {
        placement: this.element.floaterConfig?.placement,
        middleware: middleware || []
      }).then(({ x, y }) => { // eslint-disable-line id-length
        Object.assign(this.element.bib.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    } else if (strategy === 'cover') {
      // Compute the position of the bib
      computePosition(this.element.parentNode, this.element.bib, {
        placement: 'bottom-start'
      }).then(({ x, y }) => { // eslint-disable-line id-length
        Object.assign(this.element.bib.style, {
          left: `${x}px`,
          top: `${y - this.element.parentNode.offsetHeight}px`,
          width: `${this.element.parentNode.offsetWidth}px`,
          height: `${this.element.parentNode.offsetHeight}px`
        });
      });
    }
  }

  /**
   * @private
   * Controls whether to lock the scrolling for the document's body.
   * @param {Boolean} lock - If true, locks the body's scrolling functionlity; otherwise, unlock.
   */
  lockScroll(lock = true) {
    if (lock) {
      document.body.style.overflow = 'hidden'; // hide body's scrollbar

      // Move `bib` by the amount the viewport is shifted to stay aligned in fullscreen.
      this.element.bib.style.transform = `translateY(${visualViewport.offsetTop}px)`;
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * @private
   * Configures the bib element's display strategy.
   *
   * Sets the bib to fullscreen or floating mode based on the provided strategy.
   * Dispatches a 'strategy-change' event if the strategy changes.
   *
   * @param {string} strategy - The positioning strategy ('fullscreen' or 'floating').
   */
  configureBibStrategy(value) {
    if (value === 'fullscreen') {
      this.element.isBibFullscreen = true;
      // reset the prev position
      this.element.bib.setAttribute('isfullscreen', "");
      this.element.bib.style.position = 'fixed';
      this.element.bib.style.top = "0px";
      this.element.bib.style.left = "0px";
      this.element.bib.style.width = '';
      this.element.bib.style.height = '';

      // reset the size that was mirroring `size` css-part
      const bibContent = this.element.bib.shadowRoot.querySelector(".container");
      if (bibContent) {
        bibContent.style.width = '';
        bibContent.style.height = '';
        bibContent.style.maxWidth = '';
        bibContent.style.maxHeight = `${window.visualViewport.height}px`;
        this.configureTrial = 0;
      } else if (this.configureTrial < MAX_CONFIGURATION_COUNT) {
        this.configureTrial += 1;

        setTimeout(() => {
          this.configureBibStrategy(value);
        }, 0);
      }

      if (this.element.isPopoverVisible) {
        this.lockScroll(true);
      }
    } else {
      this.element.bib.style.position = '';
      this.element.bib.removeAttribute('isfullscreen');
      this.element.isBibFullscreen = false;
    }

    const isChanged = this.strategy && this.strategy !== value;
    this.strategy = value;
    if (isChanged) {
      const event = new CustomEvent(this.eventPrefix ? `${this.eventPrefix}-strategy-change` : 'strategy-change', {
        detail: {
          value,
        },
        composed: true
      });

      this.element.dispatchEvent(event);
    }
  }

  updateState() {
    const isVisible = this.element.isPopoverVisible;
    if (!isVisible) {
      this.cleanupHideHandlers();
      try {
        this.element.cleanup?.();
      } catch (error) {
        // Do nothing
      }
    }
  }

  /**
   * @private
   * getting called on 'blur' in trigger or `focusin` in document
   *  
   * Hides the bib if focus moves outside of the trigger or bib, unless a 'noHideOnThisFocusLoss' flag is set.
   * This method checks if the currently active element is still within the trigger or bib.
   * If not, and if the bib isn't in fullscreen mode with focus lost, it hides the bib.
   */
  handleFocusLoss() {
    // if moused is being pressed, skip and let click event to handle the action
    if (isMousePressed) {
      return;
    }

    if (this.element.noHideOnThisFocusLoss ||
      this.element.hasAttribute('noHideOnThisFocusLoss')) {
      return;
    }

    const { activeElement } = document;
    // if focus is still inside of trigger or bib, do not close
    if (this.element.contains(activeElement) || this.element.bib?.contains(activeElement)) {
      return;
    }
    // if fullscreen bib is still open and the focus is missing, do not close
    if (this.element.bib.hasAttribute('isfullscreen') && activeElement === document.body) {
      return;
    }

    this.hideBib();
  }

  setupHideHandlers() {
    this.preventFocusLoseOnBibClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    this.element.bib.addEventListener('mousedown', this.preventFocusLoseOnBibClick);

    // Define handlers & store references
    this.focusHandler = () => this.handleFocusLoss();

    this.clickHandler = (evt) => {
      if ((!evt.composedPath().includes(this.element.trigger) &&
        !evt.composedPath().includes(this.element.bib)) ||
        (this.element.bib.backdrop && evt.composedPath().includes(this.element.bib.backdrop))) {
        const existedVisibleFloatingUI = document.expandedAuroFormkitDropdown || document.expandedAuroFloater;

        if (existedVisibleFloatingUI && existedVisibleFloatingUI.element.isPopoverVisible) {
          // if something else is open, close that
          existedVisibleFloatingUI.hideBib();
          document.expandedAuroFormkitDropdown = null;
          document.expandedAuroFloater = this;
        } else {
          this.hideBib();
        }
      }
    };

    // ESC key handler
    this.keyDownHandler = (evt) => {
      if (evt.key === 'Escape' && this.element.isPopoverVisible) {
        const existedVisibleFloatingUI = document.expandedAuroFormkitDropdown || document.expandedAuroFloater;
        if (existedVisibleFloatingUI && existedVisibleFloatingUI !== this && existedVisibleFloatingUI.element.isPopoverVisible) {
          // if something else is open, let it handle itself
          return;
        }
        this.hideBib();
      }
    };

    if (this.behavior !== 'drawer' && this.behavior !== 'dialog') {
      // Add event listeners using the stored references
      document.addEventListener('focusin', this.focusHandler);
    }

    document.addEventListener('keydown', this.keyDownHandler);

    // send this task to the end of queue to prevent conflicting
    // it conflicts if showBib gets call from a button that's not this.element.trigger
    setTimeout(() => {
      window.addEventListener('click', this.clickHandler);
    }, 0);
  }

  cleanupHideHandlers() {
    // Remove event listeners if they exist

    if (this.preventFocusLoseOnBibClick) {
      this.element.bib.removeEventListener('mousedown', this.preventFocusLoseOnBibClick);
      delete this.preventFocusLoseOnBibClick;
    }

    if (this.focusHandler) {
      document.removeEventListener('focusin', this.focusHandler);
      this.focusHandler = null;
    }

    if (this.clickHandler) {
      window.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }

    if (this.keyDownHandler) {
      document.removeEventListener('keydown', this.keyDownHandler);
      this.keyDownHandler = null;
    }
  }

  handleUpdate(changedProperties) {
    if (changedProperties.has('isPopoverVisible')) {
      this.updateState();
    }
  }

  updateCurrentExpandedDropdown() {
    // Close any other dropdown that is already open
    const existedVisibleFloatingUI = document.expandedAuroFormkitDropdown || document.expandedAuroFloater;
    if (existedVisibleFloatingUI && existedVisibleFloatingUI !== this &&
      existedVisibleFloatingUI.isPopoverVisible &&
      document.expandedAuroFloater.eventPrefix === this.eventPrefix) {
      document.expandedAuroFloater.hideBib();
    }

    document.expandedAuroFloater = this;
  }

  showBib() {
    if (!this.element.disabled && !this.showing) {
      this.updateCurrentExpandedDropdown();
      this.element.triggerChevron?.setAttribute('data-expanded', true);

      // prevent double showing: isPopovervisible gets first and showBib gets called later
      if (!this.showing) {
        if (!this.element.modal) {
          this.setupHideHandlers();
        }
        this.showing = true;
        this.element.isPopoverVisible = true;
        this.position();
        this.dispatchEventDropdownToggle();
      }

      // Setup auto update to handle resize and scroll
      this.element.cleanup = autoUpdate(this.element.trigger || this.element.parentNode, this.element.bib, () => {
        this.position();
      });
    }
  }

  hideBib() {
    if (!this.element.disabled && !this.element.noToggle) {
      this.lockScroll(false);
      this.element.triggerChevron?.removeAttribute('data-expanded');

      if (this.element.isPopoverVisible) {
        this.element.isPopoverVisible = false;
      }
      if (this.showing) {
        this.cleanupHideHandlers();
        this.showing = false;
        this.dispatchEventDropdownToggle();
      }
    }
    document.expandedAuroFloater = null;
  }

  /**
   * @private
   * @returns {void} Dispatches event with an object showing the state of the dropdown.
   */
  dispatchEventDropdownToggle() {
    const event = new CustomEvent(this.eventPrefix ? `${this.eventPrefix}-toggled` : 'toggled', {
      detail: {
        expanded: this.showing,
      },
      composed: true
    });

    this.element.dispatchEvent(event);
  }

  handleClick() {
    if (this.element.isPopoverVisible) {
      this.hideBib();
    } else {
      this.showBib();
    }

    const event = new CustomEvent(this.eventPrefix ? `${this.eventPrefix}-triggerClick` : "triggerClick", {
      composed: true,
      detail: {
        expanded: this.element.isPopoverVisible
      }
    });

    this.element.dispatchEvent(event);
  }

  handleEvent(event) {
    if (!this.element.disableEventShow) {
      switch (event.type) {
        case 'keydown':
          // Support both Enter and Space keys for accessibility
          // Space is included as it's expected behavior for interactive elements
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault(); // Prevent page scroll on space
            this.handleClick();
          }
          break;
        case 'mouseenter':
          if (this.element.hoverToggle) {
            this.showBib();
          }
          break;
        case 'mouseleave':
          if (this.element.hoverToggle) {
            this.hideBib();
          }
          break;
        case 'focus':
          if (this.element.focusShow) {

            /*
              This needs to better handle clicking that gives focus -
              currently it shows and then immediately hides the bib
            */
            this.showBib();
          }
          break;
        case 'blur':
          // send this task 100ms later queue to
          // wait a frame in case focus moves within the floating element/bib
          setTimeout(() => this.handleFocusLoss(), 0);
          break;
        case 'click':
          if (document.activeElement === document.body) {
            event.currentTarget.focus();
          }
          this.handleClick();
          break;
        default:
        // Do nothing
      }
    }
  }

  /**
   * Manages the tabIndex of the trigger element based on its focusability.
   *
   * If the trigger element or any of its children are inherently focusable, the tabIndex of the component is set to -1.
   * This prevents the component itself from being focusable when the trigger element already handles focus.
   */
  handleTriggerTabIndex() {
    const focusableElementSelectors = [
      'a',
      'button',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
      'auro-button',
      'auro-input',
      'auro-hyperlink'
    ];

    const triggerNode = this.element.querySelectorAll('[slot="trigger"]')[0];
    if (!triggerNode) {
      return;
    }
    const triggerNodeTagName = triggerNode.tagName.toLowerCase();

    focusableElementSelectors.forEach((selector) => {
      // Check if the trigger node element is focusable
      if (triggerNodeTagName === selector) {
        this.element.tabIndex = -1;
        return;
      }

      // Check if any child is focusable
      if (triggerNode.querySelector(selector)) {
        this.element.tabIndex = -1;
      }
    });
  }

  /**
   *
   * @param {*} eventPrefix
   */
  regenerateBibId() {
    this.id = this.element.getAttribute('id');
    if (!this.id) {
      this.id = window.crypto.randomUUID();
      this.element.setAttribute('id', this.id);
    }
    
    this.element.bib.setAttribute("id", `${this.id}-floater-bib`);
  }

  configure(elem, eventPrefix) {
    this.eventPrefix = eventPrefix;
    if (this.element !== elem) {
      this.element = elem;
    }

    if (this.behavior !== this.element.behavior) {
      this.behavior = this.element.behavior;
    }

    if (this.element.trigger) {
      this.disconnect();
    }
    this.element.trigger = this.element.triggerElement || this.element.shadowRoot.querySelector('#trigger') || this.element.trigger;
    this.element.bib = this.element.shadowRoot.querySelector('#bib') || this.element.bib;
    this.element.bibSizer = this.element.shadowRoot.querySelector('#bibSizer');
    this.element.triggerChevron = this.element.shadowRoot.querySelector('#showStateIcon');


    if (this.element.floaterConfig) {
      this.element.hoverToggle = this.element.floaterConfig.hoverToggle;
    }

    document.body.append(this.element.bib);

    this.regenerateBibId();
    this.handleTriggerTabIndex();

    this.handleEvent = this.handleEvent.bind(this);
    if (this.element.trigger) {
      this.element.trigger.addEventListener('keydown', this.handleEvent);
      this.element.trigger.addEventListener('click', this.handleEvent);
      this.element.trigger.addEventListener('mouseenter', this.handleEvent);
      this.element.trigger.addEventListener('mouseleave', this.handleEvent);
      this.element.trigger.addEventListener('focus', this.handleEvent);
      this.element.trigger.addEventListener('blur', this.handleEvent);
    }
  }

  disconnect() {
    this.cleanupHideHandlers();
    if (this.element) {
      this.element.cleanup?.();

      // Remove event & keyboard listeners
      if (this.element?.trigger) {
        this.element.trigger.removeEventListener('keydown', this.handleEvent);
        this.element.trigger.removeEventListener('click', this.handleEvent);
        this.element.trigger.removeEventListener('mouseenter', this.handleEvent);
        this.element.trigger.removeEventListener('mouseleave', this.handleEvent);
        this.element.trigger.removeEventListener('focus', this.handleEvent);
        this.element.trigger.removeEventListener('blur', this.handleEvent);
      }
    }
  }
}
