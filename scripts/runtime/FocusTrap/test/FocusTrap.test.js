// Try this alternative approach
import { expect } from '@open-wc/testing';
import { html, render } from 'lit';
import sinon from 'sinon';
import { FocusTrap } from '../FocusTrap.mjs';

async function fixture(template) {
  const wrapper = document.createElement('div');
  render(template, wrapper);
  document.body.appendChild(wrapper);
  await new Promise(resolve => setTimeout(resolve, 0)); // Give browser time to render
  return wrapper.firstElementChild;
}

describe('FocusTrap', () => {
  let container;
  let focusTrap;

  beforeEach(async () => {
    // Create a container with focusable elements
    container = await fixture(html`
      <div>
        <button id="first">First</button>
        <input id="middle" type="text" />
        <a href="#" id="last">Last</a>
      </div>
    `);
  });

  afterEach(() => {
    if (focusTrap) {
      focusTrap.disconnect();
      focusTrap = null;
    }
  });

  describe('constructor', () => {
    it('should create a new instance with a valid container', () => {
      expect(() => new FocusTrap(container)).to.not.throw();
    });

    it('should throw an error if container is not a valid HTMLElement', () => {
      expect(() => new FocusTrap(null)).to.throw('FocusTrap requires a valid HTMLElement');
      expect(() => new FocusTrap({})).to.throw('FocusTrap requires a valid HTMLElement');
    });
  });

  describe('initialization', () => {
    it('should set attributes on the container', () => {
      focusTrap = new FocusTrap(container);

      if ('inert' in HTMLElement.prototype) {
        expect(container.inert).to.be.false;
        expect(container.hasAttribute('data-focus-trap-container')).to.be.true;
      }
    });
  });

  describe('focus management', () => {
    it('should focus the first element when focusFirstElement is called', () => {
      focusTrap = new FocusTrap(container);
      const firstButton = container.querySelector('#first');

      focusTrap.focusFirstElement();
      expect(document.activeElement).to.equal(firstButton);
    });

    it('should focus the last element when focusLastElement is called', () => {
      focusTrap = new FocusTrap(container);
      const lastLink = container.querySelector('#last');

      focusTrap.focusLastElement();
      expect(document.activeElement).to.equal(lastLink);
    });
  });

  describe('keyboard navigation', () => {
    it('should trap focus and cycle to the first element when tabbing from the last element', async () => {
      focusTrap = new FocusTrap(container);
      const lastLink = container.querySelector('#last');
      const firstButton = container.querySelector('#first');

      // Create a spy on the focus method of the first button
      const firstButtonFocusSpy = sinon.spy(firstButton, 'focus');

      lastLink.focus();
      expect(document.activeElement).to.equal(lastLink);

      // Simulate Tab key press
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        composed: true
      });

      lastLink.dispatchEvent(tabEvent);

      // Check if focus method was called on the first element
      expect(firstButtonFocusSpy.calledOnce).to.be.true;
      firstButtonFocusSpy.restore(); // Clean up the spy
    });

    it('should trap focus and cycle to the last element when shift-tabbing from the first element', async () => {
      focusTrap = new FocusTrap(container);
      const firstButton = container.querySelector('#first');
      const lastLink = container.querySelector('#last');

      // Create a spy on the focus method of the last link
      const lastLinkFocusSpy = sinon.spy(lastLink, 'focus');

      firstButton.focus();
      expect(document.activeElement).to.equal(firstButton);

      // Simulate Shift+Tab key press
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      });

      firstButton.dispatchEvent(shiftTabEvent);

      // Check if focus method was called on the last element
      expect(lastLinkFocusSpy.calledOnce).to.be.true;
      lastLinkFocusSpy.restore(); // Clean up the spy
    });
  });

  describe('cleanup', () => {
    it('should remove attributes when disconnected', () => {
      focusTrap = new FocusTrap(container);

      focusTrap.disconnect();

      expect(container.hasAttribute('data-focus-trap-container')).to.be.false;
    });
  });

  describe('shadow DOM support', () => {
    it('should work with shadow DOM elements', async () => {
      // Create a custom element with shadow DOM
      const shadowHost = await fixture(html`
        <div id="shadow-host"></div>
      `);

      // Create shadow root
      const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

      // Add focusable elements to shadow DOM
      shadowRoot.innerHTML = `
        <button id="shadow-first">First</button>
        <input id="shadow-middle" type="text" />
        <a href="#" id="shadow-last">Last</a>
      `;

      focusTrap = new FocusTrap(shadowHost);
      const firstButton = shadowRoot.querySelector('#shadow-first');
      const lastLink = shadowRoot.querySelector('#shadow-last');

      focusTrap.focusFirstElement();
      expect(shadowRoot.activeElement).to.equal(firstButton);

      focusTrap.focusLastElement();
      expect(shadowRoot.activeElement).to.equal(lastLink);
    });
  });
});