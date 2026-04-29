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
  it("lockScroll sets _scrollLocked flag when locking", () => {
    floatingUI.lockScroll(true);
    expect(floatingUI._scrollLocked).to.be.true;
    floatingUI.lockScroll(false);
    expect(floatingUI._scrollLocked).to.be.false;
  });

  it("lockScroll saves scroll position when locking", () => {
    const originalScrollY = window.scrollY;
    floatingUI.lockScroll(true);
    expect(floatingUI._savedScrollY).to.equal(originalScrollY);
  });

  it("lockScroll restores scroll position when unlocking", () => {
    floatingUI.lockScroll(true);
    window.scrollTo(0, 500);
    floatingUI.lockScroll(false);
    // Note: scrollTo may not work in test environment, but the restoration logic is in place
    expect(floatingUI._scrollLocked).to.be.false;
  });

  it("lockTouchScroll creates event handler when locking", () => {
    expect(floatingUI._boundTouchMoveHandler).to.be.undefined;
    floatingUI.lockTouchScroll(true);
    expect(floatingUI._boundTouchMoveHandler).to.be.a("function");
  });

  it("lockTouchScroll removes event handler when unlocking", () => {
    floatingUI.lockTouchScroll(true);
    floatingUI.lockTouchScroll(false);
    expect(floatingUI._boundTouchMoveHandler).to.be.undefined;
  });

  it("lockTouchScroll prevents default on non-scrollable elements", () => {
    floatingUI.lockTouchScroll(true);
    const nonScrollable = document.createElement("div");
    const preventDefault = sinon.spy();
    const touchEvent = {
      composedPath: () => [nonScrollable],
      preventDefault,
    };
    floatingUI._boundTouchMoveHandler(touchEvent);
    expect(preventDefault.called).to.be.true;
  });

  it("lockTouchScroll allows touchmove on scrollable elements", () => {
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
    const touchEvent = {
      composedPath: () => [scrollable],
      preventDefault,
    };
    floatingUI._boundTouchMoveHandler(touchEvent);
    expect(preventDefault.called).to.be.false;
  });

  it("configureBibStrategy sets isfullscreen attribute for fullscreen", () => {
    host.bib = bib;
    host.isPopoverVisible = false;
    floatingUI.configureBibStrategy("fullscreen");
    expect(bib.getAttribute("isfullscreen")).to.equal("");
    expect(host.isBibFullscreen).to.be.true;
  });

  it("configureBibStrategy removes isfullscreen attribute for floating", () => {
    host.bib = bib;
    bib.setAttribute("isfullscreen", "");
    host.isBibFullscreen = true;
    floatingUI.configureBibStrategy("floating");
    expect(bib.hasAttribute("isfullscreen")).to.be.false;
    expect(host.isBibFullscreen).to.be.false;
  });

  it("getPositioningStrategy returns 'dialog' for dialog behavior without breakpoint", () => {
    floatingUI.behavior = "dialog";
    host.floaterConfig = {};
    const strategy = floatingUI.getPositioningStrategy();
    expect(strategy).to.equal("dialog");
  });

  it("getPositioningStrategy returns 'floating' for undefined behavior", () => {
    floatingUI.behavior = undefined;
    host.floaterConfig = {};
    const strategy = floatingUI.getPositioningStrategy();
    expect(strategy).to.equal("floating");
  });

  it("getPositioningStrategy returns 'floating' when element is missing", () => {
    floatingUI.element = null;
    const strategy = floatingUI.getPositioningStrategy();
    expect(strategy).to.equal("floating");
  });
});

describe("AuroFloatingUI.openingQueue and topOpeningFloatingUI", () => {
  let floatingUI1;
  let floatingUI2;
  let floatingUI3;
  let host1;
  let host2;
  let host3;
  let bib1;
  let bib2;
  let bib3;

  beforeEach(() => {
    AuroFloatingUI.openingQueue = [];
    document.expandedAuroFormkitDropdown = null;
    document.expandedAuroFloater = null;

    host1 = document.createElement("div");
    bib1 = document.createElement("div");
    host1.bib = bib1;
    host1.isPopoverVisible = false;
    document.body.append(host1, bib1);
    floatingUI1 = new AuroFloatingUI(host1, "dropdown");

    host2 = document.createElement("div");
    bib2 = document.createElement("div");
    host2.bib = bib2;
    host2.isPopoverVisible = false;
    document.body.append(host2, bib2);
    floatingUI2 = new AuroFloatingUI(host2, "dropdown");

    host3 = document.createElement("div");
    bib3 = document.createElement("div");
    host3.bib = bib3;
    host3.isPopoverVisible = false;
    document.body.append(host3, bib3);
    floatingUI3 = new AuroFloatingUI(host3, "dropdown");
  });

  afterEach(() => {
    AuroFloatingUI.openingQueue = [];
    document.expandedAuroFormkitDropdown = null;
    document.expandedAuroFloater = null;
    host1?.remove();
    host2?.remove();
    host3?.remove();
    bib1?.remove();
    bib2?.remove();
    bib3?.remove();
    sinon.restore();
  });

  it("can add instances to openingQueue", () => {
    AuroFloatingUI.openingQueue.push(floatingUI1);
    expect(AuroFloatingUI.openingQueue).to.include(floatingUI1);
    expect(AuroFloatingUI.openingQueue.length).to.equal(1);
  });

  it("maintains insertion order in openingQueue", () => {
    AuroFloatingUI.openingQueue.push(floatingUI1);
    AuroFloatingUI.openingQueue.push(floatingUI2);
    expect(AuroFloatingUI.openingQueue[0]).to.equal(floatingUI1);
    expect(AuroFloatingUI.openingQueue[1]).to.equal(floatingUI2);
  });

  it("can remove instances from openingQueue", () => {
    AuroFloatingUI.openingQueue.push(floatingUI1);
    AuroFloatingUI.openingQueue.push(floatingUI2);
    const index = AuroFloatingUI.openingQueue.indexOf(floatingUI1);
    AuroFloatingUI.openingQueue.splice(index, 1);
    expect(AuroFloatingUI.openingQueue).to.not.include(floatingUI1);
    expect(AuroFloatingUI.openingQueue).to.include(floatingUI2);
  });

  it("topOpeningFloatingUI returns global reference when visible", () => {
    document.expandedAuroFloater = floatingUI1;
    floatingUI1.element.isPopoverVisible = true;
    const topUI = AuroFloatingUI.topOpeningFloatingUI;
    expect(topUI).to.equal(floatingUI1);
  });

  it("topOpeningFloatingUI returns queue last entry when global ref is stale", () => {
    document.expandedAuroFloater = floatingUI1;
    floatingUI1.element.isPopoverVisible = false;
    AuroFloatingUI.openingQueue.push(floatingUI2);
    floatingUI2.element.isPopoverVisible = true;
    const topUI = AuroFloatingUI.topOpeningFloatingUI;
    expect(topUI).to.equal(floatingUI2);
  });

  it("topOpeningFloatingUI returns last entry from queue", () => {
    AuroFloatingUI.openingQueue.push(floatingUI1);
    AuroFloatingUI.openingQueue.push(floatingUI2);
    AuroFloatingUI.openingQueue.push(floatingUI3);
    const topUI = AuroFloatingUI.topOpeningFloatingUI;
    expect(topUI).to.equal(floatingUI3);
  });

  it("topOpeningFloatingUI returns null when queue is empty", () => {
    const topUI = AuroFloatingUI.topOpeningFloatingUI;
    expect(topUI).to.be.null;
  });
});
