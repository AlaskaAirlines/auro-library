/* eslint-disable curly, lines-around-comment, no-magic-numbers, id-length */
import { autoUpdate, computePosition, offset, autoPlacement, flip, hide, arrow, inline } from '@floating-ui/dom';

export class PopoverPositioner {

  /**
   * @param {HTMLElement} referenceEl - The reference element (trigger)
   * @param {HTMLElement} floatingEl - The floating element (dropdown)
   * @param {Object} options - Configuration options
   *  @param {string} [options.placement='bottom-start'] - Positioning placement of the floating element
   *  @param {number} [options.offset=0] - Distance in pixels from the reference element
   *  @param {boolean} [options.autoStart=true] - Whether to start auto-updating the position immediately
   *  @param {HTMLElement} [options.arrowEl=null] - Optional arrow element to position (e.g., <div class="arrow"></div>)
   *  @param {boolean} [options.useAutoPlacement=true] - Whether to use auto placement to find optimal position
   *  @param {boolean} [options.useFlip=true] - Whether to flip the floating element if it doesn't fit
   *  @param {boolean} [options.useHide=true] - Whether to hide the floating element if it doesn't fit
   *  @param {string} [options.strategy='absolute'] - Positioning strategy ('absolute' or 'fixed')
   *  @param {boolean} [options.inline=false] - Whether to position inline (needed for hyperlinks and inline elements)
   */
  constructor(referenceEl, floatingEl, options = {}) {
    this.referenceEl = referenceEl;
    this.floatingEl = floatingEl;
    this.options = options;
    this.setFloaterStyles();
    if (this.options.autoStart !== false) this.start();
    this.cleanup = null;
  }

  setFloaterStyles() {
    if (!this.floatingEl) return;
    const defaultStyles = {
      position: 'absolute',
      margin: '0'
    };
    Object.assign(this.floatingEl.style, defaultStyles);
  }

  /**
   * Update the position of the floating element
   */
  updatePosition() {
    if (!this.referenceEl || !this.floatingEl) return;

    const middleware = [].concat(
      this.options.offset && this.options.offset !== 0 ? offset(this.options.offset) : [],
      this.options.arrowEl ? arrow({ element: this.options.arrowEl }) : [],
      this.options.useFlip ? flip() : [],
      this.options.useAutoPlacement ? autoPlacement() : [],
      this.options.useHide ? hide() : [],
      this.options.inline ? inline() : []
    );

    computePosition(this.referenceEl, this.floatingEl, {
      strategy: this.options.strategy || 'absolute',
      placement: this.options.placement || 'bottom-start',
      middleware
    }).then(({ x, y, middlewareData }) => {
      Object.assign(this.floatingEl?.style ?? {}, {
        visibility: middlewareData.hide?.referenceHidden
          ? 'hidden'
          : 'visible',
        left: `${x}px`,
        top: `${y}px`
      });
    });
  }

  /**
   * Start auto-updating the position
   * @returns {Function} Cleanup function
   */
  start() {
    if (this.cleanup) {
      this.cleanup();
    }

    this.cleanup = autoUpdate(
      this.referenceEl,
      this.floatingEl,
      this.updatePosition.bind(this)
    );

    return this.cleanup;
  }

  /**
   * Stop auto-updating the position
   */
  stop() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
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
};
