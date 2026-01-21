import { expect } from "@open-wc/testing";
import { html, render } from "lit";
import sinon from "sinon";
import { ClickTracker } from "../ClickTracker.mjs";

async function fixture(template) {
  const wrapper = document.createElement("div");
  render(template, wrapper);
  document.body.appendChild(wrapper);
  await new Promise((resolve) => setTimeout(resolve, 0)); // Give browser time to render
  return wrapper.firstElementChild;
}

describe("ClickTracker", () => {
  let container;
  let clickTracker;
  let onClickSpy;
  let onInnerClickSpy;
  let onOuterClickSpy;

  beforeEach(async () => {
    // Create a container element for testing
    container = await fixture(html`
      <div id="test-container" style="width: 100px; height: 100px; background: red;">
        <button id="inner-button">Inner Button</button>
      </div>
    `);

    // Create spies for callback functions
    onClickSpy = sinon.spy();
    onInnerClickSpy = sinon.spy();
    onOuterClickSpy = sinon.spy();
  });

  afterEach(() => {
    if (clickTracker) {
      clickTracker.disconnect();
      clickTracker = null;
    }
    if (container && container.parentNode) {
      container.parentNode.remove();
    }
    sinon.restore();
  });

  describe("constructor", () => {
    it("should create a new instance with a valid target element", () => {
      expect(() => new ClickTracker({ target: container })).to.not.throw();
    });

    it("should throw an error if target element is not provided", () => {
      expect(() => new ClickTracker({})).to.throw(
        "ClickHandler: Target element is required",
      );
      expect(() => new ClickTracker({ target: null })).to.throw(
        "ClickHandler: Target element is required",
      );
      expect(() => new ClickTracker({ target: undefined })).to.throw(
        "ClickHandler: Target element is required",
      );
    });

    it("should accept all callback options", () => {
      clickTracker = new ClickTracker({
        target: container,
        onClick: onClickSpy,
        onInnerClick: onInnerClickSpy,
        onOuterClick: onOuterClickSpy,
      });

      expect(clickTracker).to.be.instanceOf(ClickTracker);
    });

    it("should work with only target element provided", () => {
      clickTracker = new ClickTracker({ target: container });
      expect(clickTracker).to.be.instanceOf(ClickTracker);
    });
  });

  describe("click tracking functionality", () => {
    beforeEach(() => {
      clickTracker = new ClickTracker({
        target: container,
        onClick: onClickSpy,
        onInnerClick: onInnerClickSpy,
        onOuterClick: onOuterClickSpy,
      });
    });

    it("should detect clicks inside the target element", async () => {
      const button = container.querySelector("#inner-button");

      // Simulate a click on the inner button
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(clickEvent);

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onClickSpy.calledOnce).to.be.true;
      expect(onClickSpy.calledWith({ clickLocation: "inside" })).to.be.true;
      expect(onInnerClickSpy.calledOnce).to.be.true;
      expect(onOuterClickSpy.called).to.be.false;
    });

    it("should detect clicks on the target element itself", async () => {
      // Simulate a click on the container itself
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      container.dispatchEvent(clickEvent);

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onClickSpy.calledOnce).to.be.true;
      expect(onClickSpy.calledWith({ clickLocation: "inside" })).to.be.true;
      expect(onInnerClickSpy.calledOnce).to.be.true;
      expect(onOuterClickSpy.called).to.be.false;
    });

    it("should detect clicks outside the target element", async () => {
      // Create an element outside the container
      const outsideElement = document.createElement("div");
      document.body.appendChild(outsideElement);

      // Simulate a click on the outside element
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      outsideElement.dispatchEvent(clickEvent);

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onClickSpy.calledOnce).to.be.true;
      expect(onClickSpy.calledWith({ clickLocation: "outside" })).to.be.true;
      expect(onInnerClickSpy.called).to.be.false;
      expect(onOuterClickSpy.calledOnce).to.be.true;

      // Clean up
      outsideElement.remove();
    });

    it("should handle clicks when only onClick callback is provided", async () => {
      clickTracker.disconnect();
      clickTracker = new ClickTracker({
        target: container,
        onClick: onClickSpy,
      });

      const button = container.querySelector("#inner-button");
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(clickEvent);

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onClickSpy.calledOnce).to.be.true;
      expect(onClickSpy.calledWith({ clickLocation: "inside" })).to.be.true;
    });

    it("should handle clicks when only onInnerClick callback is provided", async () => {
      clickTracker.disconnect();
      clickTracker = new ClickTracker({
        target: container,
        onInnerClick: onInnerClickSpy,
      });

      const button = container.querySelector("#inner-button");
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(clickEvent);

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onInnerClickSpy.calledOnce).to.be.true;
    });

    it("should handle clicks when only onOuterClick callback is provided", async () => {
      clickTracker.disconnect();
      clickTracker = new ClickTracker({
        target: container,
        onOuterClick: onOuterClickSpy,
      });

      // Create an element outside the container
      const outsideElement = document.createElement("div");
      document.body.appendChild(outsideElement);

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      outsideElement.dispatchEvent(clickEvent);

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onOuterClickSpy.calledOnce).to.be.true;

      // Clean up
      outsideElement.remove();
    });
  });

  describe("multiple instances", () => {
    let container2;
    let clickTracker2;
    let onClickSpy2;
    let onInnerClickSpy2;
    let onOuterClickSpy2;

    beforeEach(async () => {
      // Create second container
      container2 = await fixture(html`
        <div id="test-container-2" style="width: 100px; height: 100px; background: blue;">
          <span id="inner-span">Inner Span</span>
        </div>
      `);

      // Create spies for second instance
      onClickSpy2 = sinon.spy();
      onInnerClickSpy2 = sinon.spy();
      onOuterClickSpy2 = sinon.spy();

      // Create first instance
      clickTracker = new ClickTracker({
        target: container,
        onClick: onClickSpy,
        onInnerClick: onInnerClickSpy,
        onOuterClick: onOuterClickSpy,
      });

      // Create second instance
      clickTracker2 = new ClickTracker({
        target: container2,
        onClick: onClickSpy2,
        onInnerClick: onInnerClickSpy2,
        onOuterClick: onOuterClickSpy2,
      });
    });

    afterEach(() => {
      if (clickTracker2) {
        clickTracker2.disconnect();
        clickTracker2 = null;
      }
      if (container2 && container2.parentNode) {
        container2.parentNode.remove();
      }
    });

    it("should handle multiple instances correctly", async () => {
      const button = container.querySelector("#inner-button");

      // Click on first container
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(clickEvent);

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      // First instance should detect inside click
      expect(onClickSpy.calledOnce).to.be.true;
      expect(onClickSpy.calledWith({ clickLocation: "inside" })).to.be.true;
      expect(onInnerClickSpy.calledOnce).to.be.true;
      expect(onOuterClickSpy.called).to.be.false;

      // Second instance should detect outside click
      expect(onClickSpy2.calledOnce).to.be.true;
      expect(onClickSpy2.calledWith({ clickLocation: "outside" })).to.be.true;
      expect(onInnerClickSpy2.called).to.be.false;
      expect(onOuterClickSpy2.calledOnce).to.be.true;
    });

    it("should properly clean up when one instance is disconnected", async () => {
      // Disconnect first instance
      clickTracker.disconnect();
      clickTracker = null;

      // Reset spies
      onClickSpy.resetHistory();
      onInnerClickSpy.resetHistory();
      onOuterClickSpy.resetHistory();
      onClickSpy2.resetHistory();
      onInnerClickSpy2.resetHistory();
      onOuterClickSpy2.resetHistory();

      const span = container2.querySelector("#inner-span");

      // Click on second container
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      span.dispatchEvent(clickEvent);

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      // First instance should not be called (disconnected)
      expect(onClickSpy.called).to.be.false;
      expect(onInnerClickSpy.called).to.be.false;
      expect(onOuterClickSpy.called).to.be.false;

      // Second instance should work normally
      expect(onClickSpy2.calledOnce).to.be.true;
      expect(onClickSpy2.calledWith({ clickLocation: "inside" })).to.be.true;
      expect(onInnerClickSpy2.calledOnce).to.be.true;
      expect(onOuterClickSpy2.called).to.be.false;
    });
  });

  describe("disconnect method", () => {
    it("should properly disconnect and clean up event listeners", () => {
      clickTracker = new ClickTracker({
        target: container,
        onClick: onClickSpy,
      });

      // Verify instance is created
      expect(clickTracker).to.be.instanceOf(ClickTracker);

      // Disconnect should not throw
      expect(() => clickTracker.disconnect()).to.not.throw();

      // Create an outside element and click it
      const outsideElement = document.createElement("div");
      document.body.appendChild(outsideElement);

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      outsideElement.dispatchEvent(clickEvent);

      // Callback should not be called after disconnect
      expect(onClickSpy.called).to.be.false;

      // Clean up
      outsideElement.remove();
    });

    it("should handle multiple disconnect calls gracefully", () => {
      clickTracker = new ClickTracker({
        target: container,
        onClick: onClickSpy,
      });

      // Multiple disconnects should not throw
      expect(() => {
        clickTracker.disconnect();
        clickTracker.disconnect();
        clickTracker.disconnect();
      }).to.not.throw();
    });
  });

  describe("shadow DOM handling", () => {
    let shadowHost;
    let shadowRoot;
    let shadowButton;

    beforeEach(() => {
      // Create shadow DOM for testing
      shadowHost = document.createElement("div");
      shadowRoot = shadowHost.attachShadow({ mode: "open" });
      shadowButton = document.createElement("button");
      shadowButton.textContent = "Shadow Button";
      shadowRoot.appendChild(shadowButton);
      container.appendChild(shadowHost);
    });

    it("should handle clicks inside shadow DOM correctly", async () => {
      clickTracker = new ClickTracker({
        target: container,
        onClick: onClickSpy,
        onInnerClick: onInnerClickSpy,
        onOuterClick: onOuterClickSpy,
      });

      // Click on shadow button
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        composed: true, // Important for shadow DOM
      });

      shadowButton.dispatchEvent(clickEvent);

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onClickSpy.calledOnce).to.be.true;
      expect(onClickSpy.calledWith({ clickLocation: "inside" })).to.be.true;
      expect(onInnerClickSpy.calledOnce).to.be.true;
      expect(onOuterClickSpy.called).to.be.false;
    });
  });
});
