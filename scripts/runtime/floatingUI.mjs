/* eslint-disable line-comment-position, no-inline-comments */

import {computePosition, offset, autoPlacement, flip} from '@floating-ui/dom';

export default class AuroFloatingUI {
  bibUpdate(element) {
    this.position(element, element.trigger, element.bib);
  }

  position(element, referenceEl, floatingEl) {
    const middleware = [offset(element.floaterConfig.offset || 0)];

    if (element.floaterConfig.flip) {
      middleware.push(flip());
    }

    if (element.floaterConfig.autoPlacement) {
      middleware.push(autoPlacement());
    }

    computePosition(referenceEl, floatingEl, {
      placement: element.floaterConfig.placement || 'bottom',
      middleware: middleware || []
    }).then(({x, y}) => { // eslint-disable-line id-length
      Object.assign(floatingEl.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  showBib(element) {
    if (!element.disabled && !element.isPopoverVisible) {
      // First, close any other dropdown that is already open
      if (document.expandedAuroDropdown) {
        // document.expandedAuroDropdown.hideBib();
        this.hideBib(document.expandedAuroDropdown);
      }

      document.expandedAuroDropdown = this;

      // Then, show this dropdown
      element.bib.style.display = 'block';
      this.bibUpdate(element);
      element.isPopoverVisible = true; // does Floating UI already surface this?
      element.trigger.setAttribute('aria-expanded', true);

      // wrap this so we can clean it up when the bib is hidden
      // document.querySelector('body').addEventListener('click', (evt) => {
      //   if (!evt.composedPath().includes(this)) {
      //     this.hideBib();
      //   }
      // });
      if (!element.noHideOnThisFocusLoss && !element.hasAttribute('noHideOnThisFocusLoss')) {
        document.activeElement.addEventListener('focusout', () => {
          if (document.activeElement !== document.querySelector('body') && !element.contains(document.activeElement)) {
            this.hideBib(element);
          }
        });

        document.querySelector('body').addEventListener('click', (evt) => {
          if (!evt.composedPath().includes(element)) {
            this.hideBib(element);
          }
        });
      }
    }
  }

  hideBib(element) {
    if (element.isPopoverVisible && !element.disabled && !element.noToggle) { // do we really want noToggle here?
      element.bib.style.display = ''; // should this be unset or none?
      element.isPopoverVisible = false;
      element.trigger.setAttribute('aria-expanded', false);
    }
  }

  configure(element) {
    element.trigger = element.shadowRoot.querySelector('#trigger');
    element.bib = element.shadowRoot.querySelector('#bib');

    element.trigger.addEventListener('click', (event) => this.handleEvent(event, element));
    element.trigger.addEventListener('mouseenter', (event) => this.handleEvent(event, element));
    element.trigger.addEventListener('mouseleave', (event) => this.handleEvent(event, element));
    element.trigger.addEventListener('focus', (event) => this.handleEvent(event, element));
    element.trigger.addEventListener('blur', (event) => this.handleEvent(event, element));
  }

  handleClick(element) {
    if (this.isPopoverVisible) {
      this.hideBib(element);
    } else {
      this.showBib(element);
    }

    // should this be left in dropdown?
    const event = new CustomEvent('auroDropdown-triggerClick', {
      composed: true,
      details: {
        expanded: this.isPopoverVisible
      }
    });

    element.dispatchEvent(event);
  }

  handleEvent(event, element) {
    if (!element.disableEventShow) {
      switch (event.type) {
        case 'mouseenter':
          if (element.hoverToggle) {
            this.showBib(element);
          }
          break;
        case 'mouseleave':
          if (element.hoverToggle) {
            this.hideBib(element);
          }
          break;
        case 'focus':
          if (element.focusShow) {
            // this needs to better handle clicking that gives focus - currently it shows and then immediately hides the bib
            this.showBib(element);
          }
          break;
        case 'blur':
          // this likely needs to be improved to handle focus within the bib for datepicker
          if (!element.noHideOnThisFocusLoss && !element.hasAttribute('noHideOnThisFocusLoss')) { // why do we have to do both here?
            this.hideBib(element);
          }
          break;
        case 'click':
          this.handleClick(element);
          break;
        default:
          // do nothing
        // add cases for show and toggle by keyboard space and enter key - maybe this is handled already?
      }
    }
  }
}
