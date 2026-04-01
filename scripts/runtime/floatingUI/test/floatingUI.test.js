import { expect } from "@open-wc/testing";
import { html, render } from "lit";
import sinon from "sinon";
import AuroFloatingUI from "../../floatingUI.mjs";

async function fixture(template) {
  const wrapper = document.createElement("div");
  render(template, wrapper);
  document.body.appendChild(wrapper);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper.firstElementChild;
}

/**
 * Builds a minimal element stub that satisfies the properties AuroFloatingUI
 * reads during configure() and keyboard event handling.
 */
function makeElement(trigger, bib) {
  return {
    trigger,
    bib,
    bibSizer: null,
    triggerChevron: null,
    shadowRoot: {
      querySelector: () => null,
      append: () => {},
    },
    behavior: "dropdown",
    disabled: false,
    isPopoverVisible: false,
    showing: false,
    noToggle: false,
    modal: false,
    disableEventShow: false,
    hoverToggle: false,
    focusShow: false,
    floaterConfig: null,
    cleanup: null,
    contains: () => false,
    dispatchEvent: () => {},
    getAttribute: () => null,
    setAttribute: () => {},
    querySelectorAll: () => [],
    style: {},
  };
}

describe("AuroFloatingUI keyboard gate (enableKeyboardHandling)", () => {
  let triggerEl;
  let bibEl;
  let elem;
  let floatingUi;

  beforeEach(async () => {
    triggerEl = await fixture(html`<button id="trigger">Toggle</button>`);
    bibEl = await fixture(html`<div id="bib"></div>`);

    elem = makeElement(triggerEl, bibEl);
    floatingUi = new AuroFloatingUI(elem, "dropdown");
  });

  afterEach(async () => {
    // Let any setTimeout(0) handlers (e.g. click listener setup in setupHideHandlers)
    // fire before cleanup so cleanupHideHandlers can remove them.
    await new Promise((resolve) => setTimeout(resolve, 10));
    document.expandedAuroFloater = null;
    document.expandedAuroFormkitDropdown = null;
    floatingUi?.disconnect();
    floatingUi = null;
    triggerEl?.parentNode?.remove();
    bibEl?.parentNode?.remove();
    sinon.restore();
  });

  describe("default behavior (enableKeyboardHandling = true)", () => {
    beforeEach(() => {
      floatingUi.configure(elem, "auro-dropdown", true);
    });

    it("Enter on the trigger calls handleClick()", () => {
      const spy = sinon.spy(floatingUi, "handleClick");
      triggerEl.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          composed: true,
        }),
      );
      expect(spy.calledOnce).to.be.true;
    });

    it("Space on the trigger calls handleClick()", () => {
      const spy = sinon.spy(floatingUi, "handleClick");
      triggerEl.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: " ",
          bubbles: true,
          composed: true,
        }),
      );
      expect(spy.calledOnce).to.be.true;
    });

    it("Escape dismisses when bib is visible", () => {
      elem.isPopoverVisible = true;
      floatingUi.showing = true;
      document.expandedAuroFloater = floatingUi;
      const spy = sinon.spy(floatingUi, "hideBib");

      // setupHideHandlers attaches the document keydown listener
      floatingUi.setupHideHandlers();
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );

      expect(spy.calledOnce).to.be.true;
      document.expandedAuroFloater = null;
    });
  });

  describe("keyboard disabled (enableKeyboardHandling = false)", () => {
    beforeEach(() => {
      floatingUi.configure(elem, "auro-dropdown", false);
    });

    it("Enter on the trigger does NOT call handleClick()", () => {
      const spy = sinon.spy(floatingUi, "handleClick");
      triggerEl.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          composed: true,
        }),
      );
      expect(spy.called).to.be.false;
    });

    it("Space on the trigger does NOT call handleClick()", () => {
      const spy = sinon.spy(floatingUi, "handleClick");
      triggerEl.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: " ",
          bubbles: true,
          composed: true,
        }),
      );
      expect(spy.called).to.be.false;
    });

    it("Escape does NOT dismiss the bib", () => {
      elem.isPopoverVisible = true;
      floatingUi.showing = true;
      document.expandedAuroFloater = floatingUi;
      const spy = sinon.spy(floatingUi, "hideBib");

      // setupHideHandlers should skip attaching the document keydown listener
      floatingUi.setupHideHandlers();
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );

      expect(spy.called).to.be.false;
      document.expandedAuroFloater = null;
    });

    it("click on the trigger still calls handleClick()", () => {
      const spy = sinon.spy(floatingUi, "handleClick");
      triggerEl.dispatchEvent(
        new MouseEvent("click", { bubbles: true, composed: true }),
      );
      expect(spy.calledOnce).to.be.true;
    });
  });

  describe("default argument", () => {
    it("omitting enableKeyboardHandling defaults to true (Enter still works)", () => {
      floatingUi.configure(elem, "auro-dropdown");
      const spy = sinon.spy(floatingUi, "handleClick");
      triggerEl.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          composed: true,
        }),
      );
      expect(spy.calledOnce).to.be.true;
    });
  });
});
