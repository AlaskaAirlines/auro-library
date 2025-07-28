/* eslint-disable max-classes-per-file */
import { fixture, html, expect, elementUpdated } from '@open-wc/testing';

import {
  isFocusableComponent,
  getFocusableElements
} from '../Focusables.mjs';

describe('isFocusableComponent', () => {
  it('returns true for enabled custom focusable components', async () => {
    for (const tag of [
      'auro-checkbox', 'auro-radio', 'auro-dropdown', 'auro-button', 'auro-combobox',
      'auro-input', 'auro-counter', 'auro-select', 'auro-datepicker',
      'auro-hyperlink', 'auro-accordion'
    ]) {
      const el = document.createElement(tag);
      if (tag === 'auro-hyperlink') {
        el.setAttribute('href', '#');
      }
      document.body.appendChild(el);
      expect(isFocusableComponent(el)).to.be.true;
      el.remove();
    }
  });

  it('returns false for custom components with disabled attribute', async () => {
    for (const tag of [
      'auro-checkbox', 'auro-radio', 'auro-dropdown', 'auro-button', 'auro-combobox',
      'auro-input', 'auro-counter', 'auro-select', 'auro-datepicker',
      'auro-hyperlink', 'auro-accordion'
    ]) {
      const el = document.createElement(tag);
      el.setAttribute('disabled', '');
      if (tag === 'auro-hyperlink') {
        el.setAttribute('href', '#');
      }
      document.body.appendChild(el);
      expect(isFocusableComponent(el)).to.be.false;
      el.remove();
    }
  });

  it('returns false for auro-hyperlink without href', async () => {
    const el = document.createElement('auro-hyperlink');
    document.body.appendChild(el);
    expect(isFocusableComponent(el)).to.be.false;
    el.remove();
  });

  it('returns false for non-custom elements', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(isFocusableComponent(el)).to.be.false;
    el.remove();
  });
});

describe('getFocusableElements', () => {
  it('finds standard focusable elements', async () => {
    const el = await fixture(html`
      <div>
        <button id="btn"></button>
        <input id="input">
        <a id="link" href="#"></a>
        <textarea id="ta"></textarea>
        <select id="sel"></select>
      </div>
    `);
    const focusables = getFocusableElements(el);
    expect(focusables.map(e => e.id)).to.include.members(['btn', 'input', 'link', 'ta', 'sel']);
  });

  it('skips disabled elements', async () => {
    const el = await fixture(html`
      <div>
        <button id="btn" disabled></button>
        <input id="input" disabled>
        <textarea id="ta" disabled></textarea>
        <select id="sel" disabled></select>
      </div>
    `);
    const focusables = getFocusableElements(el);
    expect(focusables.length).to.equal(0);
  });

  it('finds custom focusable components', async () => {
    const el = await fixture(html`
      <div>
        <auro-checkbox id="cb"></auro-checkbox>
        <auro-hyperlink id="hl" href="#"></auro-hyperlink>
        <auro-button id="ab"></auro-button>
      </div>
    `);
    const focusables = getFocusableElements(el);
    expect(focusables.map(e => e.id)).to.include.members(['cb', 'hl', 'ab']);
  });

  it('skips disabled custom components', async () => {
    const el = await fixture(html`
      <div>
        <auro-checkbox id="cb" disabled></auro-checkbox>
        <auro-hyperlink id="hl" disabled href="#"></auro-hyperlink>
      </div>
    `);
    const focusables = getFocusableElements(el);
    expect(focusables.length).to.equal(0);
  });

  it('finds elements in shadow DOM', async () => {
    class ShadowEl extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
      }
      connectedCallback() {
        this.shadowRoot.innerHTML = `<button id="shadowBtn"></button>`;
      }
    }
    customElements.define('shadow-el', ShadowEl);
    const el = await fixture(html`
      <div>
        <shadow-el id="host"></shadow-el>
      </div>
    `);
    await elementUpdated(el);
    const focusables = getFocusableElements(el);
    // Should find the button inside shadow DOM
    const shadowBtn = el.querySelector('shadow-el').shadowRoot.getElementById('shadowBtn');
    expect(focusables).to.include(shadowBtn);
  });

  it('finds elements assigned to slots', async () => {
    class SlotEl extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
      }
      connectedCallback() {
        this.shadowRoot.innerHTML = `<slot></slot>`;
      }
    }
    customElements.define('slot-el', SlotEl);
    const el = await fixture(html`
      <slot-el>
        <button id="slottedBtn"></button>
      </slot-el>
    `);
    await elementUpdated(el);
    const focusables = getFocusableElements(el);
    const slottedBtn = el.querySelector('#slottedBtn');
    expect(focusables).to.include(slottedBtn);
  });

  it('does not return duplicates', async () => {
    // This is a contrived case, but let's check that duplicates are not returned
    const el = await fixture(html`
      <div>
        <button id="btn"></button>
      </div>
    `);
    const focusables = getFocusableElements(el);
    // Should only have one instance of the button
    expect(focusables.filter(e => e.id === 'btn').length).to.equal(1);
  });
});