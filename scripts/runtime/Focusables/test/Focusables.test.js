/* eslint-disable max-classes-per-file */
import { expect, fixtureSync, html } from "@open-wc/testing";

import { getFocusableElements, isFocusableComponent } from "../Focusables.mjs";

describe("isFocusableComponent", () => {
  it("returns true for enabled custom focusable components", async () => {
    for (const tag of [
      "auro-checkbox",
      "auro-radio",
      "auro-dropdown",
      "auro-button",
      "auro-combobox",
      "auro-input",
      "auro-counter",
      "auro-select",
      "auro-datepicker",
      "auro-hyperlink",
      "auro-accordion",
    ]) {
      const el = document.createElement(tag);
      if (tag === "auro-hyperlink") {
        el.setAttribute("href", "#");
      }
      document.body.appendChild(el);
      expect(isFocusableComponent(el)).to.be.true;
      el.remove();
    }
  });

  it("returns false for custom components with disabled attribute", async () => {
    for (const tag of [
      "auro-checkbox",
      "auro-radio",
      "auro-dropdown",
      "auro-button",
      "auro-combobox",
      "auro-input",
      "auro-counter",
      "auro-select",
      "auro-datepicker",
      "auro-hyperlink",
      "auro-accordion",
    ]) {
      const el = document.createElement(tag);
      el.setAttribute("disabled", "");
      if (tag === "auro-hyperlink") {
        el.setAttribute("href", "#");
      }
      document.body.appendChild(el);
      expect(isFocusableComponent(el)).to.be.false;
      el.remove();
    }
  });

  it("returns false for auro-hyperlink without href", async () => {
    const el = document.createElement("auro-hyperlink");
    document.body.appendChild(el);
    expect(isFocusableComponent(el)).to.be.false;
    el.remove();
  });

  it("returns false for non-custom elements", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(isFocusableComponent(el)).to.be.false;
    el.remove();
  });
});

// fixtureSync is used instead of fixture to avoid requestAnimationFrame, which Chrome
// pauses in background tabs when multiple test files run concurrently under WTR.
describe("getFocusableElements", () => {
  it("finds standard focusable elements", () => {
    const el = fixtureSync(html`
      <div>
        <button id="btn"></button>
        <input id="input">
        <a id="link" href="#"></a>
        <textarea id="ta"></textarea>
        <select id="sel"></select>
      </div>
    `);
    const focusables = getFocusableElements(el);
    expect(focusables.map((e) => e.id)).to.include.members([
      "btn",
      "input",
      "link",
      "ta",
      "sel",
    ]);
  });

  it("skips disabled elements", () => {
    const el = fixtureSync(html`
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

  it("finds custom focusable components", () => {
    const el = fixtureSync(html`
      <div>
        <auro-checkbox id="cb"></auro-checkbox>
        <auro-hyperlink id="hl" href="#"></auro-hyperlink>
        <auro-button id="ab"></auro-button>
      </div>
    `);
    const focusables = getFocusableElements(el);
    expect(focusables.map((e) => e.id)).to.include.members(["cb", "hl", "ab"]);
  });

  it("skips disabled custom components", () => {
    const el = fixtureSync(html`
      <div>
        <auro-checkbox id="cb" disabled></auro-checkbox>
        <auro-hyperlink id="hl" disabled href="#"></auro-hyperlink>
      </div>
    `);
    const focusables = getFocusableElements(el);
    expect(focusables.length).to.equal(0);
  });

  it("finds elements in shadow DOM", () => {
    class ShadowEl extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const btn = document.createElement("button");
        btn.id = "shadowBtn";
        this.shadowRoot.appendChild(btn);
      }
    }
    customElements.define("shadow-el", ShadowEl);
    const el = fixtureSync(html`
      <div>
        <shadow-el id="host"></shadow-el>
      </div>
    `);
    const focusables = getFocusableElements(el);
    const shadowBtn = el
      .querySelector("shadow-el")
      .shadowRoot.getElementById("shadowBtn");
    expect(focusables).to.include(shadowBtn);
  });

  it("finds elements assigned to slots", () => {
    class SlotEl extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        this.shadowRoot.appendChild(document.createElement("slot"));
      }
    }
    customElements.define("slot-el", SlotEl);
    const el = fixtureSync(html`
      <slot-el>
        <button id="slottedBtn"></button>
      </slot-el>
    `);
    const focusables = getFocusableElements(el);
    const slottedBtn = el.querySelector("#slottedBtn");
    expect(focusables).to.include(slottedBtn);
  });

  it("does not return duplicates", () => {
    const el = fixtureSync(html`
      <div>
        <button id="btn"></button>
      </div>
    `);
    const focusables = getFocusableElements(el);
    expect(focusables.filter((e) => e.id === "btn").length).to.equal(1);
  });
});
