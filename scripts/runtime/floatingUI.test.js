import { expect } from "@open-wc/testing";
import sinon from "sinon";
import AuroFloatingUI from "./floatingUI.mjs";

describe("AuroFloatingUI", () => {
  let host;
  let bib;
  let floatingUI;
  let hideBibSpy;

  beforeEach(() => {
    host = document.createElement("div");
    bib = document.createElement("div");
    host.bib = bib;
    host.triggerChevron = document.createElement("span");

    document.body.append(host, bib);

    AuroFloatingUI.isMousePressed = false;
    floatingUI = new AuroFloatingUI(host, "dropdown");
    hideBibSpy = sinon.spy(floatingUI, "hideBib");
  });

  afterEach(() => {
    sinon.restore();
    AuroFloatingUI.isMousePressed = false;
    host?.remove();
    bib?.remove();
  });

  it("does not hide when the host matches focus-within", () => {
    const checkedSelectors = [];

    sinon.stub(host, "matches").callsFake((selector) => {
      checkedSelectors.push(selector);

      if (selector === ":focus") {
        return false;
      }

      if (selector === ":focus-within") {
        return true;
      }

      return false;
    });

    floatingUI.handleFocusLoss();

    expect(checkedSelectors).to.deep.equal([":focus", ":focus-within"]);
    expect(hideBibSpy.called).to.be.false;
  });

  it("does not hide when the host matches focus", () => {
    const checkedSelectors = [];

    sinon.stub(host, "matches").callsFake((selector) => {
      checkedSelectors.push(selector);

      if (selector === ":focus") {
        return true;
      }

      return false;
    });

    floatingUI.handleFocusLoss();

    expect(checkedSelectors).to.deep.equal([":focus"]);
    expect(hideBibSpy.called).to.be.false;
  });

  it("does not hide when the bib is fullscreen", () => {
    const checkedSelectors = [];

    bib.setAttribute("isfullscreen", "");

    sinon.stub(host, "matches").callsFake((selector) => {
      checkedSelectors.push(selector);
      return false;
    });

    floatingUI.handleFocusLoss();

    expect(checkedSelectors).to.deep.equal([":focus", ":focus-within"]);
    expect(hideBibSpy.called).to.be.false;
  });

  it("hides with a keydown event when the host no longer has focus", () => {
    const checkedSelectors = [];

    sinon.stub(host, "matches").callsFake((selector) => {
      checkedSelectors.push(selector);
      return false;
    });

    floatingUI.handleFocusLoss();

    expect(checkedSelectors).to.deep.equal([":focus", ":focus-within"]);
    expect(hideBibSpy.calledOnceWithExactly("keydown")).to.be.true;
  });

  it("no-ops safely when element is not set", () => {
    floatingUI.element = null;

    expect(() => floatingUI.showBib()).to.not.throw();
    expect(() => floatingUI.hideBib()).to.not.throw();
    expect(() => floatingUI.handleClick()).to.not.throw();
    expect(() => floatingUI.handleEvent(new Event("click"))).to.not.throw();
    expect(() => floatingUI.handleFocusLoss()).to.not.throw();
    expect(() => floatingUI.updateState()).to.not.throw();
    expect(() => floatingUI.configureBibStrategy("floating")).to.not.throw();
    expect(() => floatingUI.position()).to.not.throw();
  });

  it("does not enter a visible state when required DOM nodes are missing", () => {
    host.bib = null;
    host.isPopoverVisible = false;

    floatingUI.showBib();

    expect(floatingUI.showing).to.equal(false);
    expect(host.isPopoverVisible).to.equal(false);
    expect(document.expandedAuroFloater).to.not.equal(floatingUI);
  });

  it("returns an explicit positioning strategy when element is not set", () => {
    floatingUI.element = null;

    expect(floatingUI.getPositioningStrategy()).to.equal("floating");
  });
});
