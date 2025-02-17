/* eslint-disable line-comment-position, no-inline-comments */

import { autoUpdate, computePosition, offset, autoPlacement, flip } from '@floating-ui/dom';

export default class AuroFloatingUI {
  constructor() {
    // Store event listener references for cleanup
    this.focusHandler = null;
    this.clickHandler = null;
    this.keyDownHandler = null;
    
    /**
     * @private
     */
    this.eventPrefix = undefined;
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
   * @returns {String} The positioning strategy, either 'fullscreen' or 'floating'.
   */
  getPositioningStrategy() {
    let strategy = 'floating';
    if (this.element.bib.mobileFullscreenBreakpoint) {
      const smallerThanBreakpoint = window.matchMedia(`(max-width: ${this.element.bib.mobileFullscreenBreakpoint})`).matches;
      if (smallerThanBreakpoint) {
        strategy = 'fullscreen';
      }
    }

    return strategy;
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
        offset(this.element.floaterConfig.offset || 0),
        ...(this.element.floaterConfig.flip ? [flip()] : []), // Add flip middleware if flip is enabled
        ...(this.element.floaterConfig.autoPlacement ? [autoPlacement()] : []), // Add autoPlacement middleware if autoPlacement is enabled
      ];

      // Compute the position of the bib
      computePosition(this.element.trigger, this.element.bib, {
        placement: this.element.floaterConfig.placement || 'bottom',
        middleware: middleware || []
      }).then(({x, y}) => { // eslint-disable-line id-length
        Object.assign(this.element.bib.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
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
  configureBibStrategy(strategy) {
    const prevStrategy = this.element.isBibFullscreen ? 'fullscreen' : 'floating';
    if (strategy === 'fullscreen') {
      this.element.isBibFullscreen = true;
      // reset the prev position
      this.element.bib.style.top = "0px";
      this.element.bib.style.left = "0px";

      // reset the size that was mirroring `size` css-part
      const bibContent = this.element.bib.shadowRoot.querySelector(".container");
      bibContent.style.width = '';
      bibContent.style.height = '';
      bibContent.style.maxWidth = '';
      bibContent.style.maxHeight = '';

      if (this.element.isPopoverVisible) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      this.element.isBibFullscreen = false;

      document.body.style.overflow = '';
    }

    if (prevStrategy !== strategy) {
      const event = new CustomEvent(this.eventPrefix ? `${this.eventPrefix}-strategy-change` : 'strategy-change', {
        detail: {
          strategy,
        },
        composed: true
      });

      this.element.dispatchEvent(event);
    }
  }

  updateState() {
    const isVisible = this.element.isPopoverVisible;

    // Refactor this to apply attribute to correct focusable element
    // Reference Issue: https://github.com/AlaskaAirlines/auro-library/issues/105
    //
    // this.element.trigger.setAttribute('aria-expanded', isVisible);

    if (isVisible) {
      this.element.bib.setAttribute('data-show', true);
    } else {
      this.element.bib.removeAttribute('data-show');
    }

    if (!isVisible) {
      this.cleanupHideHandlers();
      try {
        this.element.cleanup?.();
      } catch (error) {
        // Do nothing
      }
    }
  }

  handleFocusLoss() {
    if (this.element.noHideOnThisFocusLoss || 
        this.element.hasAttribute('noHideOnThisFocusLoss')) {
      return;
    }

    const {activeElement} = document;
    if (activeElement === document.querySelector('body') ||
        this.element.contains(activeElement) ||
        this.element.bibContent?.contains(activeElement)) {
      return;
    }

    this.hideBib();
  }

  setupHideHandlers() {
    // Define handlers & store references
    this.focusHandler = () => this.handleFocusLoss();

    this.clickHandler = (evt) => {
      if (!evt.composedPath().includes(this.element.trigger) && 
          !evt.composedPath().includes(this.element.bibContent)) {
        this.hideBib();
      }
    };

    // ESC key handler
    this.keyDownHandler = (evt) => {
      if (evt.key === 'Escape' && this.element.isPopoverVisible) {
        this.hideBib();
      }
    };

    // Add event listeners using the stored references
    document.addEventListener('focusin', this.focusHandler);
    window.addEventListener('click', this.clickHandler);
    document.addEventListener('keydown', this.keyDownHandler);
  }

  cleanupHideHandlers() {
    // Remove event listeners if they exist
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
    if (document.expandedAuroDropdown) {
      this.hideBib(document.expandedAuroDropdown);
    }

    document.expandedAuroDropdown = this;
  }

  showBib() {
    if (!this.element.disabled && !this.element.isPopoverVisible) {
      this.updateCurrentExpandedDropdown();
      this.element.isPopoverVisible = true;
      this.element.triggerChevron?.setAttribute('data-expanded', true);
      
      this.dispatchEventDropdownToggle();
      this.position();
      
      // Clean up any existing handlers before setting up new ones
      this.cleanupHideHandlers();
      this.setupHideHandlers();

      // Setup auto update to handle resize and scroll
      this.element.cleanup = autoUpdate(this.element.trigger, this.element.bib, () => {
        this.position();
      });
    }
  }

  hideBib() {
    if (this.element.isPopoverVisible && !this.element.disabled && !this.element.noToggle) {
      this.element.isPopoverVisible = false;
      document.body.style.overflow = '';
      this.element.triggerChevron?.removeAttribute('data-expanded');
      this.dispatchEventDropdownToggle();
    }
  }

  /**
   * @private
   * @returns {void} Dispatches event with an object showing the state of the dropdown.
   */
  dispatchEventDropdownToggle() {
    const event = new CustomEvent(this.eventPrefix ? `${this.eventPrefix}-toggled` : 'toggled', {
      detail: {
        expanded: this.element.isPopoverVisible,
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
          this.handleFocusLoss();
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

  configure(elem, eventPrefix) {
    this.eventPrefix = eventPrefix;
    this.element = elem;
    this.element.trigger = this.element.shadowRoot.querySelector('#trigger');
    this.element.bib = this.element.shadowRoot.querySelector('#bib');
    this.element.bibSizer = this.element.shadowRoot.querySelector('#bibSizer');
    this.element.triggerChevron = this.element.shadowRoot.querySelector('#showStateIcon');

    document.body.append(this.element.bib);

    this.handleTriggerTabIndex();

    this.handleEvent = this.handleEvent.bind(this);
    this.element.trigger.addEventListener('keydown', this.handleEvent);
    this.element.trigger.addEventListener('click', this.handleEvent);
    this.element.trigger.addEventListener('mouseenter', this.handleEvent);
    this.element.trigger.addEventListener('mouseleave', this.handleEvent);
    this.element.trigger.addEventListener('focus', this.handleEvent);
    this.element.trigger.addEventListener('blur', this.handleEvent);
  }

  disconnect() {
    this.cleanupHideHandlers();
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
