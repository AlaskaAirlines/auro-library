/* eslint-disable line-comment-position, no-inline-comments */

import {
  autoPlacement,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";

const MAX_CONFIGURATION_COUNT = 10;

export default class AuroFloatingUI {
  /**
   * @private
   */
  static isMousePressed = false;

  /**
   * @private
   */
  static isMousePressHandlerInitialized = false;

  /**
   * @private
   */
  static setupMousePressChecker() {
    if (
      !AuroFloatingUI.isMousePressHandlerInitialized &&
      window &&
      window.addEventListener
    ) {
      AuroFloatingUI.isMousePressHandlerInitialized = true;

      // Track timeout for isMousePressed reset to avoid race conditions
      if (!AuroFloatingUI._mousePressedTimeout) {
        AuroFloatingUI._mousePressedTimeout = null;
      }
      const mouseEventGlobalHandler = (event) => {
        const isPressed = event.type === "mousedown";
        if (isPressed) {
          // Clear any pending timeout to prevent race condition
          if (AuroFloatingUI._mousePressedTimeout !== null) {
            clearTimeout(AuroFloatingUI._mousePressedTimeout);
            AuroFloatingUI._mousePressedTimeout = null;
          }
          if (!AuroFloatingUI.isMousePressed) {
            AuroFloatingUI.isMousePressed = true;
          }
        } else if (AuroFloatingUI.isMousePressed && !isPressed) {
          // Schedule reset and track timeout ID
          AuroFloatingUI._mousePressedTimeout = setTimeout(() => {
            AuroFloatingUI.isMousePressed = false;
            AuroFloatingUI._mousePressedTimeout = null;
          }, 0);
        }
      };

      window.addEventListener("mousedown", mouseEventGlobalHandler);
      window.addEventListener("mouseup", mouseEventGlobalHandler);
    }
  }

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
    this.enableKeyboardHandling = true;

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
    const element = this.element;
    if (!element) {
      return;
    }

    // mirror the boxsize from bibSizer
    if (element.bibSizer && element.matchWidth && element.bib?.shadowRoot) {
      const sizerStyle = window.getComputedStyle(element.bibSizer);
      const bibContent = element.bib.shadowRoot.querySelector(".container");
      if (!bibContent) {
        return;
      }

      if (sizerStyle.width !== "0px") {
        bibContent.style.width = sizerStyle.width;
      }
      if (sizerStyle.height !== "0px") {
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
    const element = this.element;
    if (!element) {
      return;
    }

    const breakpoint =
      element.bib?.mobileFullscreenBreakpoint ||
      element.floaterConfig?.fullscreenBreakpoint;
    switch (this.behavior) {
      case "tooltip":
        return "floating";
      case "dialog":
      case "drawer":
        if (breakpoint) {
          const smallerThanBreakpoint = window.matchMedia(
            `(max-width: ${breakpoint})`,
          ).matches;

          element.expanded = smallerThanBreakpoint;
        }
        if (element.nested) {
          return "cover";
        }
        return "fullscreen";
      case "dropdown":
      case undefined:
      case null:
        if (breakpoint) {
          const smallerThanBreakpoint = window.matchMedia(
            `(max-width: ${breakpoint})`,
          ).matches;
          if (smallerThanBreakpoint) {
            return "fullscreen";
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
    const element = this.element;
    if (!element) {
      return;
    }

    const strategy = this.getPositioningStrategy();
    this.configureBibStrategy(strategy);

    if (strategy === "floating") {
      if (!element.trigger || !element.bib) {
        return;
      }

      this.mirrorSize();
      // Define the middlware for the floater configuration
      const middleware = [
        offset(element.floaterConfig?.offset || 0),
        ...(element.floaterConfig?.shift ? [shift()] : []), // Add shift middleware if shift is enabled.
        ...(element.floaterConfig?.flip ? [flip()] : []), // Add flip middleware if flip is enabled.
        ...(element.floaterConfig?.autoPlacement ? [autoPlacement()] : []), // Add autoPlacement middleware if autoPlacement is enabled.
      ];

      // Compute the position of the bib
      computePosition(element.trigger, element.bib, {
        strategy: element.floaterConfig?.strategy || "fixed",
        placement: element.floaterConfig?.placement,
        middleware: middleware || [],
      }).then(({ x, y }) => {
        // eslint-disable-line id-length
        const currentElement = this.element;
        if (!currentElement?.bib) {
          return;
        }

        Object.assign(currentElement.bib.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    } else if (strategy === "cover") {
      if (!element.parentNode || !element.bib) {
        return;
      }

      // Compute the position of the bib
      computePosition(element.parentNode, element.bib, {
        placement: "bottom-start",
      }).then(({ x, y }) => {
        // eslint-disable-line id-length
        const currentElement = this.element;
        if (!currentElement?.bib || !currentElement.parentNode) {
          return;
        }

        Object.assign(currentElement.bib.style, {
          left: `${x}px`,
          top: `${y - currentElement.parentNode.offsetHeight}px`,
          width: `${currentElement.parentNode.offsetWidth}px`,
          height: `${currentElement.parentNode.offsetHeight}px`,
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
    const element = this.element;

    if (lock) {
      if (!element?.bib) {
        return;
      }

      document.body.style.overflow = "hidden"; // hide body's scrollbar

      // Move `bib` by the amount the viewport is shifted to stay aligned in fullscreen.
      element.bib.style.transform = `translateY(${window?.visualViewport?.offsetTop}px)`;
    } else {
      document.body.style.overflow = "";
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
    const element = this.element;
    if (!element?.bib) {
      return;
    }

    if (value === "fullscreen") {
      element.isBibFullscreen = true;
      // reset the prev position
      element.bib.setAttribute("isfullscreen", "");
      element.bib.style.position = "fixed";
      element.bib.style.top = "0px";
      element.bib.style.left = "0px";
      element.bib.style.width = "";
      element.bib.style.height = "";
      element.style.contain = "";

      // reset the size that was mirroring `size` css-part
      const bibContent = element.bib.shadowRoot?.querySelector(".container");
      if (bibContent) {
        bibContent.style.width = "";
        bibContent.style.height = "";
        bibContent.style.maxWidth = "";
        bibContent.style.maxHeight = `${window?.visualViewport?.height}px`;
        this.configureTrial = 0;
      } else if (this.configureTrial < MAX_CONFIGURATION_COUNT) {
        this.configureTrial += 1;

        setTimeout(() => {
          this.configureBibStrategy(value);
        }, 0);
      }

      if (element.isPopoverVisible) {
        this.lockScroll(true);
      }
    } else {
      element.bib.style.position = "";
      element.bib.removeAttribute("isfullscreen");
      element.isBibFullscreen = false;
      element.style.contain = "layout";
    }

    const isChanged = this.strategy && this.strategy !== value;
    this.strategy = value;
    if (isChanged) {
      const event = new CustomEvent(
        this.eventPrefix
          ? `${this.eventPrefix}-strategy-change`
          : "strategy-change",
        {
          detail: {
            value,
          },
          composed: true,
        },
      );

      element.dispatchEvent(event);
    }
  }

  updateState() {
    const element = this.element;
    if (!element) {
      return;
    }

    const isVisible = element.isPopoverVisible;
    if (!isVisible) {
      this.cleanupHideHandlers();
      try {
        element.cleanup?.();
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
    const element = this.element;
    if (!element?.bib) {
      return;
    }

    // if mouse is being pressed, skip and let click event to handle the action
    if (AuroFloatingUI.isMousePressed) {
      return;
    }

    if (
      element.noHideOnThisFocusLoss ||
      element.hasAttribute("noHideOnThisFocusLoss")
    ) {
      return;
    }

    // if focus is still inside of trigger or bib, do not close
    if (element.matches(":focus") || element.matches(":focus-within")) {
      return;
    }

    // if fullscreen bib is in fullscreen mode, do not close
    if (element.bib.hasAttribute("isfullscreen")) {
      return;
    }

    this.hideBib("keydown");
  }

  setupHideHandlers() {
    const element = this.element;
    if (!element) {
      return;
    }

    // Define handlers & store references
    this.focusHandler = () => this.handleFocusLoss();

    this.clickHandler = (evt) => {
      const element = this.element;
      if (!element?.bib) {
        return;
      }

      // When the bib is fullscreen (modal dialog), don't close on outside
      // clicks. VoiceOver's synthetic click events inside a top-layer modal
      // <dialog> may not include the bib in composedPath(), causing false
      // positives. This mirrors the fullscreen guard in handleFocusLoss().
      if (element.bib.hasAttribute("isfullscreen")) {
        return;
      }

      if (
        (!evt.composedPath().includes(element.trigger) &&
          !evt.composedPath().includes(element.bib)) ||
        (element.bib.backdrop &&
          evt.composedPath().includes(element.bib.backdrop))
      ) {
        const existedVisibleFloatingUI =
          document.expandedAuroFormkitDropdown || document.expandedAuroFloater;

        if (
          existedVisibleFloatingUI &&
          existedVisibleFloatingUI.element.isPopoverVisible
        ) {
          // if something else is open, close that
          existedVisibleFloatingUI.hideBib();
          document.expandedAuroFormkitDropdown = null;
          document.expandedAuroFloater = this;
        } else {
          this.hideBib("click");
        }
      }
    };

    // ESC key handler
    this.keyDownHandler = (evt) => {
      const element = this.element;
      if (!element) {
        return;
      }

      if (evt.key === "Escape" && element.isPopoverVisible) {
        const existedVisibleFloatingUI =
          document.expandedAuroFormkitDropdown || document.expandedAuroFloater;
        if (
          existedVisibleFloatingUI &&
          existedVisibleFloatingUI !== this &&
          existedVisibleFloatingUI.element.isPopoverVisible
        ) {
          // if something else is open, let it handle itself
          return;
        }
        this.hideBib("keydown");
      }
    };

    if (this.behavior !== "drawer" && this.behavior !== "dialog") {
      // Add event listeners using the stored references
      document.addEventListener("focusin", this.focusHandler);
    }

    if (this.enableKeyboardHandling) {
      document.addEventListener("keydown", this.keyDownHandler);
    }

    // send this task to the end of queue to prevent conflicting
    // it conflicts if showBib gets call from a button that's not this.element.trigger
    setTimeout(() => {
      window.addEventListener("click", this.clickHandler);
    }, 0);
  }

  cleanupHideHandlers() {
    // Remove event listeners if they exist

    if (this.focusHandler) {
      document.removeEventListener("focusin", this.focusHandler);
      this.focusHandler = null;
    }

    if (this.clickHandler) {
      window.removeEventListener("click", this.clickHandler);
      this.clickHandler = null;
    }

    if (this.keyDownHandler) {
      document.removeEventListener("keydown", this.keyDownHandler);
      this.keyDownHandler = null;
    }
  }

  handleUpdate(changedProperties) {
    if (changedProperties.has("isPopoverVisible")) {
      this.updateState();
    }
  }

  updateCurrentExpandedDropdown() {
    if (!this.element) {
      return;
    }

    // Close any other dropdown that is already open
    const existedVisibleFloatingUI =
      document.expandedAuroFormkitDropdown || document.expandedAuroFloater;
    if (
      existedVisibleFloatingUI &&
      existedVisibleFloatingUI !== this &&
      existedVisibleFloatingUI.element.isPopoverVisible &&
      existedVisibleFloatingUI.eventPrefix === this.eventPrefix
    ) {
      existedVisibleFloatingUI.hideBib();
    }

    document.expandedAuroFloater = this;
  }

  showBib() {
    const element = this.element;
    if (!element) {
      return;
    }

    if (!element.disabled && !this.showing) {
      this.updateCurrentExpandedDropdown();
      element.triggerChevron?.setAttribute("data-expanded", true);

      // prevent double showing: isPopovervisible gets first and showBib gets called later
      if (!this.showing) {
        if (!element.modal) {
          this.setupHideHandlers();
        }
        this.showing = true;
        element.isPopoverVisible = true;
        this.position();
        this.dispatchEventDropdownToggle();
      }

      if (!element.bib || (!element.trigger && !element.parentNode)) {
        return;
      }

      // Setup auto update to handle resize and scroll
      element.cleanup = autoUpdate(
        element.trigger || element.parentNode,
        element.bib,
        () => {
          this.position();
        },
      );
    }
  }

  /**
   * Hides the floating UI element.
   * @param {String} eventType - The event type that triggered the hiding action.
   */
  hideBib(eventType = "unknown") {
    const element = this.element;
    if (!element) {
      return;
    }

    if (element.disabled) {
      return;
    }

    // noToggle dropdowns should not close when the trigger is clicked (the
    // "toggle" behavior), but they CAN still close via other interactions like
    // Escape key or focus loss.
    if (element.noToggle && eventType === "click") {
      return;
    }

    this.lockScroll(false);
    element.triggerChevron?.removeAttribute("data-expanded");

    if (element.isPopoverVisible) {
      element.isPopoverVisible = false;
    }
    if (this.showing) {
      this.cleanupHideHandlers();
      this.showing = false;
      this.dispatchEventDropdownToggle(eventType);
    }

    // Only clear the global reference if the bib was actually hidden.
    // Clearing it when hideBib is blocked (e.g. noToggle + click) corrupts
    // the singleton state so other dropdowns can't detect this one is still open.
    document.expandedAuroFloater = null;
  }

  /**
   * @private
   * @returns {void} Dispatches event with an object showing the state of the dropdown.
   * @param {String} eventType - The event type that triggered the toggle action.
   */
  dispatchEventDropdownToggle(eventType) {
    const element = this.element;
    if (!element) {
      return;
    }

    const event = new CustomEvent(
      this.eventPrefix ? `${this.eventPrefix}-toggled` : "toggled",
      {
        detail: {
          expanded: this.showing,
          eventType: eventType || "unknown",
        },
        composed: true,
      },
    );

    element.dispatchEvent(event);
  }

  handleClick() {
    const element = this.element;
    if (!element) {
      return;
    }

    if (element.isPopoverVisible) {
      this.hideBib("click");
    } else {
      this.showBib();
    }

    const event = new CustomEvent(
      this.eventPrefix ? `${this.eventPrefix}-triggerClick` : "triggerClick",
      {
        composed: true,
        detail: {
          expanded: element.isPopoverVisible,
        },
      },
    );

    element.dispatchEvent(event);
  }

  handleEvent(event) {
    const element = this.element;
    if (!element || element.disableEventShow) {
      return;
    }

    switch (event.type) {
      case "keydown": {
        // Support both Enter and Space keys for accessibility
        // Space is included as it's expected behavior for interactive elements

        const origin = event.composedPath()[0];
        if (
          event.key === "Enter" ||
          (event.key === " " && (!origin || origin.tagName !== "INPUT"))
        ) {
          event.preventDefault();
          this.handleClick();
        }
        break;
      }
      case "mouseenter":
        if (element.hoverToggle) {
          this.showBib();
        }
        break;
      case "mouseleave":
        if (element.hoverToggle) {
          this.hideBib("mouseleave");
        }
        break;
      case "focus":
        if (element.focusShow) {
          /*
            This needs to better handle clicking that gives focus -
            currently it shows and then immediately hides the bib
          */
          this.showBib();
        }
        break;
      case "blur":
        // send this task 100ms later queue to
        // wait a frame in case focus moves within the floating element/bib
        setTimeout(() => this.handleFocusLoss(), 0);
        break;
      case "click":
        if (document.activeElement === document.body) {
          event.currentTarget.focus();
        }
        this.handleClick();
        break;
      default:
      // Do nothing
    }
  }

  /**
   * Manages the tabIndex of the trigger element based on its focusability.
   *
   * If the trigger element or any of its children are inherently focusable, the tabIndex of the component is set to -1.
   * This prevents the component itself from being focusable when the trigger element already handles focus.
   */
  handleTriggerTabIndex() {
    const element = this.element;
    if (!element) {
      return;
    }

    const focusableElementSelectors = [
      "a",
      "button",
      'input:not([type="hidden"])',
      "select",
      "textarea",
      '[tabindex]:not([tabindex="-1"])',
      "auro-button",
      "auro-input",
      "auro-hyperlink",
    ];

    const triggerNode = element.querySelectorAll('[slot="trigger"]')[0];
    if (!triggerNode) {
      return;
    }
    const triggerNodeTagName = triggerNode.tagName.toLowerCase();

    focusableElementSelectors.forEach((selector) => {
      // Check if the trigger node element is focusable
      if (triggerNodeTagName === selector) {
        element.tabIndex = -1;
        return;
      }

      // Check if any child is focusable
      if (triggerNode.querySelector(selector)) {
        element.tabIndex = -1;
      }
    });
  }

  /**
   *
   * @param {*} eventPrefix
   */
  regenerateBibId() {
    const element = this.element;
    if (!element) {
      return;
    }

    this.id = element.getAttribute("id");
    if (!this.id) {
      this.id = window.crypto.randomUUID();
      element.setAttribute("id", this.id);
    }

    element.bib?.setAttribute("id", `${this.id}-floater-bib`);
  }

  configure(elem, eventPrefix, enableKeyboardHandling = true) {
    AuroFloatingUI.setupMousePressChecker();
    this.enableKeyboardHandling = enableKeyboardHandling;

    this.eventPrefix = eventPrefix;
    if (this.element !== elem) {
      this.element = elem;
    }

    const element = this.element;
    if (!element) {
      return;
    }

    if (this.behavior !== element.behavior) {
      this.behavior = element.behavior;
    }

    if (element.trigger) {
      this.disconnect();
    }
    element.trigger =
      element.triggerElement ||
      element.shadowRoot?.querySelector("#trigger") ||
      element.trigger;
    element.bib = element.shadowRoot?.querySelector("#bib") || element.bib;
    element.bibSizer = element.shadowRoot?.querySelector("#bibSizer");
    element.triggerChevron =
      element.shadowRoot?.querySelector("#showStateIcon");

    if (element.floaterConfig) {
      element.hoverToggle = element.floaterConfig.hoverToggle;
    }

    this.regenerateBibId();
    this.handleTriggerTabIndex();

    this.handleEvent = this.handleEvent.bind(this);
    if (element.trigger) {
      if (this.enableKeyboardHandling) {
        element.trigger.addEventListener("keydown", this.handleEvent);
      }
      element.trigger.addEventListener("click", this.handleEvent);
      element.trigger.addEventListener("mouseenter", this.handleEvent);
      element.trigger.addEventListener("mouseleave", this.handleEvent);
      element.trigger.addEventListener("focus", this.handleEvent);
      element.trigger.addEventListener("blur", this.handleEvent);
    }
  }

  disconnect() {
    this.cleanupHideHandlers();

    const element = this.element;
    if (!element) {
      return;
    }

    element.cleanup?.();

    if (element.bib && element.shadowRoot) {
      element.shadowRoot.append(element.bib);
    }

    // Remove event & keyboard listeners
    if (element.trigger) {
      element.trigger.removeEventListener("keydown", this.handleEvent);
      element.trigger.removeEventListener("click", this.handleEvent);
      element.trigger.removeEventListener("mouseenter", this.handleEvent);
      element.trigger.removeEventListener("mouseleave", this.handleEvent);
      element.trigger.removeEventListener("focus", this.handleEvent);
      element.trigger.removeEventListener("blur", this.handleEvent);
    }
  }
}
