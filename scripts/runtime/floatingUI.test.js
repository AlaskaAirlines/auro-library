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

  it("restores pre-existing inline scroll styles after lock/unlock", () => {
    document.documentElement.style.scrollbarGutter = "auto";
    document.documentElement.style.overflow = "clip";
    document.body.style.overflow = "scroll";
    document.body.style.position = "sticky";
    document.body.style.top = "12px";
    document.body.style.width = "75%";
    const scrollToStub = sinon.stub(window, "scrollTo");

    floatingUI.lockScroll(true);

    expect(document.documentElement.style.scrollbarGutter).to.equal("stable");
    expect(document.documentElement.style.overflow).to.equal("hidden");
    expect(document.body.style.overflow).to.equal("hidden");
    expect(document.body.style.position).to.equal("fixed");
    expect(document.body.style.width).to.equal("100%");

    floatingUI.lockScroll(false);

    expect(document.documentElement.style.scrollbarGutter).to.equal("auto");
    expect(document.documentElement.style.overflow).to.equal("clip");
    expect(document.body.style.overflow).to.equal("scroll");
    expect(document.body.style.position).to.equal("sticky");
    expect(document.body.style.top).to.equal("12px");
    expect(document.body.style.width).to.equal("75%");
    expect(scrollToStub.calledOnceWithExactly(0, 0)).to.be.true;
    expect(floatingUI._boundTouchMoveHandler).to.equal(undefined);
  });

  it("prevents touch scroll when gesture is outside scrollable content", () => {
    floatingUI.lockTouchScroll(true);

    const preventDefault = sinon.spy();
    floatingUI._boundTouchMoveHandler({
      composedPath: () => [document.body],
      preventDefault,
    });

    expect(preventDefault.calledOnce).to.be.true;
  });

  it("allows touch scroll when gesture is inside scrollable content", () => {
    floatingUI.lockTouchScroll(true);

    const scrollable = document.createElement("div");
    Object.defineProperty(scrollable, "scrollHeight", {
      configurable: true,
      value: 200,
    });
    Object.defineProperty(scrollable, "clientHeight", {
      configurable: true,
      value: 100,
    });

    const preventDefault = sinon.spy();
    floatingUI._boundTouchMoveHandler({
      composedPath: () => [scrollable],
      preventDefault,
    });

    expect(preventDefault.called).to.be.false;
  });
});
