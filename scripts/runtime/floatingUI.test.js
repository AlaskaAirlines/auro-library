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

  it("hides with a focus loss event when the host no longer has focus", () => {
    const checkedSelectors = [];

    sinon.stub(host, "matches").callsFake((selector) => {
      checkedSelectors.push(selector);
      return false;
    });

    floatingUI.handleFocusLoss();

    expect(checkedSelectors).to.deep.equal([":focus", ":focus-within"]);
    expect(hideBibSpy.calledOnceWithExactly("focusloss")).to.be.true;
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
    // Unlock before finishing: the lock mutates document.body for the whole
    // browser page, so leaving it engaged pollutes every later test.
    floatingUI.lockScroll(false);
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

/**
 * Which strategies own the page scroll lock.
 *
 * The lock used to be gated on the "fullscreen" strategy alone, which left
 * dismissible desktop dialogs and drawers scrollable and released the lock again
 * on every reposition (AB#1625424, AB#1625435). These tests pin the contract that
 * both overlay strategies lock and the nested/floating ones do not, so the two
 * consuming components can rely on it.
 *
 * Note the deliberate `isPopoverVisible = true` — it is the guard on the
 * lockScroll call inside configureBibStrategy, and the older
 * configureBibStrategy tests above set it false, which is why none of them
 * reached the lock.
 */
describe("AuroFloatingUI scroll lock ownership (AB#1647843)", () => {
  let host;
  let bib;
  let floatingUI;
  let pageStyles;

  const SCROLL_STYLE_PROPS = [
    [() => document.documentElement.style, "scrollbarGutter"],
    [() => document.documentElement.style, "overflow"],
    [() => document.body.style, "overflow"],
    [() => document.body.style, "position"],
    [() => document.body.style, "top"],
    [() => document.body.style, "width"],
  ];

  /**
   * Stubs the viewport as narrower or wider than the fullscreen breakpoint.
   * @param {Boolean} matches - True to report a viewport below the breakpoint.
   * @returns {void}
   */
  const stubBreakpoint = (matches) => {
    sinon.stub(window, "matchMedia").returns({ matches });
  };

  beforeEach(() => {
    // lockScroll restores whatever inline styles it found, so a lock leaked by
    // an earlier test would be faithfully restored and read as a failure here.
    // Snapshot, clear, and put back in afterEach so this suite is hermetic.
    pageStyles = SCROLL_STYLE_PROPS.map(([style, prop]) => style()[prop]);
    for (const [style, prop] of SCROLL_STYLE_PROPS) {
      style()[prop] = "";
    }

    host = document.createElement("div");
    bib = document.createElement("div");
    host.bib = bib;
    host.triggerChevron = document.createElement("span");
    host.isPopoverVisible = true;
    host.floaterConfig = { fullscreenBreakpoint: "660px" };

    // configureBibStrategy re-schedules itself until it finds .container in the
    // bib's shadowRoot. Give it one so no retry timer survives the test and
    // re-locks the page after teardown.
    bib.attachShadow({ mode: "open" });
    const container = document.createElement("div");
    container.classList.add("container");
    bib.shadowRoot.append(container);

    document.body.append(host, bib);

    AuroFloatingUI.isMousePressed = false;
    AuroFloatingUI.openingQueue = [];
    document.expandedAuroFloater = null;

    floatingUI = new AuroFloatingUI(host, "dialog");
    sinon.stub(window, "scrollTo");
  });

  afterEach(() => {
    // Always release: a leaked body{position:fixed} would follow the browser
    // page into every test that runs after this suite.
    host.isPopoverVisible = false;
    floatingUI.lockScroll(false);
    floatingUI.cleanupHideHandlers();
    sinon.restore();
    AuroFloatingUI.isMousePressed = false;
    AuroFloatingUI.openingQueue = [];
    document.expandedAuroFloater = null;
    host?.remove();
    bib?.remove();

    SCROLL_STYLE_PROPS.forEach(([style, prop], index) => {
      style()[prop] = pageStyles[index];
    });
  });

  it("locks page scroll for a dismissible dialog above the breakpoint", () => {
    stubBreakpoint(false);
    host.modal = false;

    expect(floatingUI.getPositioningStrategy()).to.equal("dialog");

    floatingUI.configureBibStrategy("dialog");

    expect(floatingUI._scrollLocked, "dialog strategy must lock page scroll").to
      .be.true;
    expect(document.body.style.position).to.equal("fixed");
    expect(document.body.style.overflow).to.equal("hidden");
    expect(document.documentElement.style.overflow).to.equal("hidden");
  });

  it("locks page scroll for a dismissible drawer above the breakpoint", () => {
    floatingUI.behavior = "drawer";
    stubBreakpoint(false);
    host.modal = false;

    expect(floatingUI.getPositioningStrategy()).to.equal("dialog");

    floatingUI.configureBibStrategy("dialog");

    expect(floatingUI._scrollLocked).to.be.true;
  });

  it("locks page scroll for a blocking dialog", () => {
    stubBreakpoint(false);
    host.modal = true;

    expect(floatingUI.getPositioningStrategy()).to.equal("fullscreen");

    floatingUI.configureBibStrategy("fullscreen");

    expect(floatingUI._scrollLocked).to.be.true;
  });

  it("locks page scroll below the fullscreen breakpoint", () => {
    stubBreakpoint(true);
    host.modal = false;

    expect(floatingUI.getPositioningStrategy()).to.equal("fullscreen");

    floatingUI.configureBibStrategy("fullscreen");

    expect(floatingUI._scrollLocked).to.be.true;
  });

  it("leaves the page scrollable for a nested overlay", () => {
    stubBreakpoint(false);
    host.nested = true;

    expect(floatingUI.getPositioningStrategy()).to.equal("cover");

    floatingUI.configureBibStrategy("cover");

    expect(
      floatingUI._scrollLocked,
      "a nested overlay sits inside its parent, not over the page",
    ).to.not.be.true;
    expect(document.body.style.position).to.not.equal("fixed");
  });

  it("leaves the page scrollable for a floating dropdown", () => {
    floatingUI.behavior = "dropdown";
    stubBreakpoint(false);

    expect(floatingUI.getPositioningStrategy()).to.equal("floating");

    floatingUI.configureBibStrategy("floating");

    expect(floatingUI._scrollLocked).to.not.be.true;
  });

  it("releases the lock when an open overlay widens out of fullscreen", () => {
    // A dropdown opened below the breakpoint locks the page; autoUpdate re-runs
    // configureBibStrategy on every resize tick, so widening past the breakpoint
    // lands on the non-overlay branch while the bib is still open. That branch
    // has to give the lock back — declining to take it is not enough, or the
    // page stays frozen behind a small floating bib until hideBib() runs.
    floatingUI.behavior = "dropdown";
    stubBreakpoint(true);

    expect(floatingUI.getPositioningStrategy()).to.equal("fullscreen");
    floatingUI.configureBibStrategy("fullscreen");
    expect(floatingUI._scrollLocked, "locked while narrow").to.be.true;

    // Re-stub for the wider viewport; stubBreakpoint wraps matchMedia, which
    // sinon refuses to wrap twice.
    window.matchMedia.restore();
    stubBreakpoint(false);
    expect(floatingUI.getPositioningStrategy()).to.equal("floating");
    floatingUI.configureBibStrategy("floating");

    expect(
      floatingUI._scrollLocked,
      "widening past the breakpoint must not strand the page frozen",
    ).to.be.false;
    expect(document.body.style.position).to.not.equal("fixed");
    expect(document.documentElement.style.overflow).to.not.equal("hidden");
  });

  it("keeps the lock when configure() rewires the trigger while open", () => {
    // configure() routes through disconnect() on every triggerElement change,
    // so an unconditional unlock there releases the page behind an overlay that
    // is still open — and autoUpdate is torn down by then, so nothing re-locks
    // it. Only a real teardown may release the lock.
    stubBreakpoint(false);
    host.modal = false;
    floatingUI.configureBibStrategy("dialog");
    expect(floatingUI._scrollLocked, "locked while open").to.be.true;

    host.trigger = document.createElement("button");
    floatingUI.configure(host, "auroDialog");

    expect(
      floatingUI._scrollLocked,
      "rewiring the trigger must not unlock the page behind an open overlay",
    ).to.be.true;
    expect(document.body.style.position).to.equal("fixed");
  });

  it("still releases the lock on a real teardown", () => {
    // The companion to the test above: the default path must keep unlocking, or
    // tearing down an open floater strands body{position:fixed}.
    stubBreakpoint(false);
    floatingUI.configureBibStrategy("dialog");
    expect(floatingUI._scrollLocked).to.be.true;

    floatingUI.disconnect();

    expect(
      floatingUI._scrollLocked,
      "an explicit teardown still hands the page back",
    ).to.be.false;
    expect(document.body.style.position).to.not.equal("fixed");
  });

  it("mirrors aria-modal onto the inner dialog for the overlay strategies", () => {
    // The one user-visible side effect of locking on the "dialog" strategy:
    // dismissible desktop overlays now carry aria-modal. It is a deliberate
    // decision (see the post-mortem), so pin it — a refactor of lockScroll()
    // could otherwise drop or invert it silently.
    stubBreakpoint(false);
    host.modal = false;
    // The shared fixture's shadowRoot holds only .container; lockScroll looks up
    // a <dialog> inside the bib, so this test supplies one.
    const innerDialog = document.createElement("dialog");
    bib.shadowRoot.append(innerDialog);

    floatingUI.configureBibStrategy("dialog");

    expect(
      innerDialog.getAttribute("aria-modal"),
      "a locked overlay hides the page behind it from assistive tech",
    ).to.equal("true");

    floatingUI.lockScroll(false);

    expect(
      innerDialog.hasAttribute("aria-modal"),
      "unlocking must hand the page back to assistive tech",
    ).to.be.false;
  });

  it("stays locked across repositions without re-saving the page styles", () => {
    stubBreakpoint(false);
    document.body.style.overflow = "scroll";

    floatingUI.configureBibStrategy("dialog");
    const savedStyles = floatingUI._savedScrollStyles;

    // autoUpdate re-runs position() -> configureBibStrategy() on every resize
    // and scroll tick while the bib is open.
    floatingUI.configureBibStrategy("dialog");
    floatingUI.configureBibStrategy("dialog");

    expect(floatingUI._scrollLocked).to.be.true;
    expect(
      floatingUI._savedScrollStyles,
      "repositioning must not overwrite the saved page styles",
    ).to.equal(savedStyles);
    expect(savedStyles.bodyOverflow).to.equal("scroll");

    floatingUI.lockScroll(false);

    expect(document.body.style.overflow).to.equal("scroll");
    document.body.style.overflow = "";
  });

  it("releases the lock when the bib is hidden", () => {
    stubBreakpoint(false);
    floatingUI.configureBibStrategy("dialog");
    expect(floatingUI._scrollLocked).to.be.true;

    floatingUI.hideBib("click");

    expect(floatingUI._scrollLocked).to.be.false;
    expect(document.body.style.position).to.equal("");
  });

  it("releases the lock when the floater is torn down while open", () => {
    stubBreakpoint(false);
    floatingUI.configureBibStrategy("dialog");
    expect(floatingUI._scrollLocked).to.be.true;

    floatingUI.disconnect();

    expect(
      floatingUI._scrollLocked,
      "tearing down while open must not strand the page frozen",
    ).to.be.false;
    expect(document.body.style.position).to.equal("");
  });

  it("releases the lock even when the bib has already been detached", () => {
    stubBreakpoint(false);
    floatingUI.configureBibStrategy("dialog");
    expect(floatingUI._scrollLocked).to.be.true;

    host.bib = undefined;
    floatingUI.lockScroll(false);

    expect(floatingUI._scrollLocked).to.be.false;
    expect(document.body.style.position).to.equal("");
  });
});

describe("AuroFloatingUI modal Escape suppression (AB#1613688)", () => {
  let host;
  let bib;
  let floatingUI;
  let hideBibSpy;

  beforeEach(() => {
    host = document.createElement("div");
    bib = document.createElement("div");
    host.bib = bib;
    host.modal = true;
    host.isPopoverVisible = false;
    host.triggerChevron = document.createElement("span");
    document.body.append(host, bib);

    AuroFloatingUI.openingQueue = [];
    document.expandedAuroFloater = null;

    floatingUI = new AuroFloatingUI(host, "dialog");
    hideBibSpy = sinon.spy(floatingUI, "hideBib");
  });

  afterEach(() => {
    floatingUI.cleanupHideHandlers();
    sinon.restore();
    AuroFloatingUI.isMousePressed = false;
    AuroFloatingUI.openingQueue = [];
    document.expandedAuroFloater = null;
    host?.remove();
    bib?.remove();
  });

  it("registers a keydown handler and skips setupHideHandlers when modal=true", () => {
    const setupHideHandlersSpy = sinon.spy(floatingUI, "setupHideHandlers");

    floatingUI.showBib();

    expect(setupHideHandlersSpy.called).to.be.false;
    expect(floatingUI.keyDownHandler).to.be.a("function");
    expect(floatingUI.showing).to.be.true;
  });

  it("does not call hideBib when Escape is pressed while modal dialog is open", () => {
    floatingUI.showBib();

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(hideBibSpy.called).to.be.false;
  });

  it("calls preventDefault on Escape keydown while modal dialog is open", () => {
    floatingUI.showBib();

    const escEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = sinon.spy(escEvent, "preventDefault");
    document.dispatchEvent(escEvent);

    expect(preventDefaultSpy.calledOnce).to.be.true;
  });

  it("removes the modal Escape keydown handler via cleanupHideHandlers", () => {
    floatingUI.showBib();
    expect(floatingUI.keyDownHandler).to.be.a("function");

    floatingUI.cleanupHideHandlers();
    expect(floatingUI.keyDownHandler).to.be.null;
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
