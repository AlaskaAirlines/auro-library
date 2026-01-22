import {
  arrow,
  autoPlacement,
  autoUpdate,
  computePosition,
  flip,
  hide,
  inline,
  offset,
} from "@floating-ui/dom";

/**
 * Positions a popover element relative to a target element using Floating UI.
 * @param {Object} config
 *  @param {HTMLElement} config.target - The reference element (trigger)
 *  @param {HTMLElement} config.popover - The floating element (dropdown)
 *  @param {Object} config.options - Configuration options
 *    @param {string} [config.options.placement='bottom-start'] - Positioning placement of the floating element
 *    @param {number} [config.options.offset=0] - Distance in pixels from the reference element
 *    @param {boolean} [config.options.autoStart=true] - Whether to start auto-updating the position immediately
 *    @param {HTMLElement} [config.options.arrowEl=null] - Optional arrow element to position (e.g., <div class="arrow"></div>)
 *    @param {boolean} [config.options.useAutoPlacement=true] - Whether to use auto placement to find optimal position
 *    @param {boolean} [config.options.useFlip=true] - Whether to flip the floating element if it doesn't fit
 *    @param {boolean} [config.options.useHide=true] - Whether to hide the floating element if it doesn't fit
 *    @param {string} [config.options.strategy='absolute'] - Positioning strategy ('absolute' or 'fixed')
 *    @param {boolean} [config.options.inline=false] - Whether to position inline (needed for hyperlinks and inline elements)
 */
export class PopoverPositioner {
  #currentPlacement;
  #currentSide;
  #currentArrowSide;
  #currentArrowDirection;

  #referenceEl;
  #floatingEl;
  #options;
  #onPlacementChange;
  #cleanup;

  constructor({
    target,
    popover,
    options = {},
    onPlacementChange = () => {},
  } = {}) {
    this.#referenceEl = target;
    this.#floatingEl = popover;
    this.#options = options;
    this.#onPlacementChange = onPlacementChange;
    this.#setInitialFloatingElementStyles();
    this.#cleanup = this.#options.autoStart !== false ? this.start() : null;
  }

  /**
   * Start auto-updating the position
   * @returns {Function} Cleanup function
   */
  start() {
    if (this.cleanup) {
      this.#cleanup();
    }

    const cleanup = autoUpdate(
      this.#referenceEl,
      this.#floatingEl,
      this.#updatePosition.bind(this),
    );

    return cleanup;
  }

  /**
   * Stop auto-updating the position
   */
  stop() {
    if (this.#cleanup) {
      this.#cleanup();
      this.#cleanup = null;
    }
  }

  /**
   * Destroy the instance and clean up
   */
  disconnect() {
    this.stop();
    this.referenceEl = null;
    this.floatingEl = null;
  }

  /**
   * Builds the list of Floating UI middleware used to position the popover. This configures how the popover behaves in response to space, visibility, and arrow requirements.
   * @returns {Array} An array of middleware instances that control offset, flipping, auto placement, hiding, inline behavior, and arrow positioning.
   */
  get #middleware() {
    return [].concat(
      this.#options.offset && this.#options.offset !== 0
        ? offset(this.#options.offset)
        : [],
      this.#options.useFlip ? flip() : [],
      this.#options.useAutoPlacement ? autoPlacement() : [],
      this.#options.useHide ? hide() : [],
      this.#options.inline ? inline() : [],
      this.#options.arrowEl ? arrow({ element: this.#options.arrowEl }) : [],
    );
  }

  /**
   * Prepares the arguments used when calling Floating UI to compute the popover position. This encapsulates the reference, floating element, and core configuration in a single structure.
   * @returns {Array} An ordered array containing the reference element, floating element, and configuration object for Floating UI.
   */
  get #floatingUiArgs() {
    return [
      this.#referenceEl,
      this.#floatingEl,
      {
        strategy: this.#options.strategy || "absolute",
        placement: this.#options.placement || "bottom-start",
        middleware: this.#middleware,
      },
    ];
  }

  /**
   * Primary callback for FloatingUI updates
   * Recomputes and applies the current popover and arrow position. This keeps the popover layout in sync with its reference element as the page or viewport changes.
   */
  #updatePosition() {
    if (!this.#referenceEl || !this.#floatingEl) return;

    computePosition(...this.#floatingUiArgs).then(
      ({ x, y, middlewareData, placement }) => {
        // Handle the new placement and get the direction the arrow should point
        const { arrowSide } = this.#handlePlacementChange({ placement });

        // Upload the position of the floating element
        this.#updateFloatingElPosition({ x, y, middlewareData });

        // Update the position of the arrow element
        this.#updateArrowPosition({
          arrowData: middlewareData.arrow,
          arrowSide,
        });
      },
    );
  }

  /**
   * Applies the base positioning styles to the floating element before any calculations run. This ensures the popover is ready to be positioned consistently by Floating UI.
   */
  #setInitialFloatingElementStyles() {
    if (!this.#floatingEl) return;
    const strategy = this.#options.strategy || "absolute";
    const defaultStyles = {
      position: strategy,
      margin: "0",
    };
    Object.assign(this.#floatingEl.style, defaultStyles);
  }

  /**
   * Derives normalized placement information from the raw Floating UI placement value. This determines how the popover and its arrow should be oriented relative to the reference element.
   * @param {Object} params
   *  @param {string} params.placement - The full placement value reported by Floating UI (e.g., "bottom-start").
   * @returns {{placement: string, side: string, arrowDirection: string, arrowSide: string}} Normalized placement data including side and arrow orientation.
   */
  #handlePlacementChange({ placement }) {
    // Get the side of the placement (top, right, bottom, left)
    const placementSide = placement.split("-")[0];
    const arrowSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[placementSide];

    // Get the direction the arrow is pointing
    const arrowDirection = {
      top: "down",
      right: "left",
      bottom: "up",
      left: "right",
    }[placementSide];

    this.#updateInternalState({
      placement,
      arrowDirection,
      arrowSide: arrowSide,
      side: placementSide,
    });

    return { placement, side: placementSide, arrowDirection, arrowSide };
  }

  /**
   * Caches the latest placement state and triggers any placement change callback. This keeps consumers informed when the popover or its arrow orientation changes.
   * @param {Object} params
   *  @param {string} params.placement - The current full placement string (e.g., "bottom-start").
   *  @param {string} params.side - The side of the reference element where the popover is placed.
   *  @param {string} params.arrowDirection - The direction the arrow visually points.
   *  @param {string} params.arrowSide - The side of the popover where the arrow is anchored.
   */
  #updateInternalState({ placement, side, arrowDirection, arrowSide }) {
    if (
      this.#currentPlacement !== placement ||
      this.#currentArrowDirection !== arrowDirection ||
      this.#currentArrowSide !== arrowSide ||
      this.#currentSide !== side
    ) {
      this.#currentPlacement = placement;
      this.#currentArrowDirection = arrowDirection;
      this.#currentArrowSide = arrowSide;
      this.#currentSide = side;
      this.#onPlacementChange?.({ placement, arrowDirection, arrowSide, side });
    }
  }

  /**
   * Applies the latest computed position to the floating element. This keeps the popover visually aligned with the reference element and updates its visibility state.
   * @param {Object} params
   *  @param {number} params.x - The horizontal position in pixels for the floating element.
   *  @param {number} params.y - The vertical position in pixels for the floating element.
   *  @param {Object} params.middlewareData - Data returned from Floating UI middleware, including visibility information.
   */
  #updateFloatingElPosition({ x, y, middlewareData }) {
    if (!this.#floatingEl) return;
    Object.assign(this.#floatingEl.style, {
      visibility: middlewareData.hide?.referenceHidden ? "hidden" : "visible",
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  /**
   * Updates the visual position of the arrow element relative to the popover. This keeps the arrow aligned with the reference element and clears any stale positioning styles.
   * @param {Object} params
   *  @param {{x: number|null, y: number|null}|null} params.arrowData - The computed arrow coordinates from Floating UI, or null if no arrow data is available.
   *  @param {string} params.arrowSide - The side of the popover where the arrow should be anchored (top, right, bottom, or left).
   */
  #updateArrowPosition({ arrowData, arrowSide }) {
    // Update the styles for the arrow element
    if (arrowData && this.#options.arrowEl) {
      // Get current arrow styles
      const arrowStyle = this.#options.arrowEl?.style;

      // Reset arrow style properties modified by this middleware below to clean up old styles before applying new ones
      const propsToReset = [
        "top",
        "bottom",
        "left",
        "right",
        ...(arrowData ? [] : ["position"]),
      ];
      propsToReset.forEach((prop) => {
        arrowStyle[prop] = "";
      });

      // Update the arrow position
      const { x, y } = arrowData;
      Object.assign(arrowStyle ?? {}, {
        left: x != null ? `${x}px` : "",
        top: y != null ? `${y}px` : "",
        [arrowSide]: `${-this.#options.arrowEl.offsetWidth}px`,
        position: "absolute",
      });
    }
  }
}
