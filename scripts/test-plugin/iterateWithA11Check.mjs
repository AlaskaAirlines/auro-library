import { expect } from '@open-wc/testing';

let originalIt;
async function checkElementAccessibility(element) {
  // test only when this element is meaningful.
  if (element.children.length || element.attributes.length) {
    await expect(element).to.be.accessible();
  }
}

function aIt(desc, action) {
  const actionWithA11y = async () => {
    const result = await action();

    let rootElement;
    if (typeof result === 'string') {
      rootElement = document.querySelector(result);
    } else if (result instanceof Element) {
      rootElement = result;
    } else {
      // fallback incase `action()` didnt return the created node.
      // The framework injdect any elements that are created during `action()` to first `div` layer under `body`.
      // this `div` will get cleared after the iteration.
      rootElement = document.body.querySelector('div');
    }

    if (rootElement) {
      await checkElementAccessibility(rootElement);
    }

    const children = [...document.body.children];
    for (let child of children) {
      if (child !== rootElement) {
        // when the iteration's element uses `floatingUI`, there will be an extra child under `body`.
        if (
          child.hasAttribute("auro-dropdownbib") ||
          child.hasAttribute("auro-floater-bib")
        ) {
          // test `floatingUI.bib`
          await checkElementAccessibility(child);
        }
      }
    }
  };

  originalIt(desc, actionWithA11y);
}

/**
 * Usage Example
 * 
 * import { getAccessibleIt } from "@aurodesignsystem/auro-library/scripts/test-plugin/iterateWithA11Check.mjs";
 * 
 * it = getAccessibleIt();
 * 
 * OR
 * 
 * import { getAccessibleIt } from "@aurodesignsystem/auro-library/scripts/test-plugin/iterateWithA11Check.mjs";
 * 
 * aIt = getAccessibleIt();
 * 
 * describe('test', () => {
 *   aIt('description', () => {
 *     ...
 *   }
 * });
 */
export function getAccessibleIt() {
  originalIt ??= it;
  return aIt;
}

/**
 * Usage Example
 * 
 * import { useAccessibleIt } from "@aurodesignsystem/auro-library/scripts/test-plugin/iterateWithA11Check.mjs";
 * useAccessibleIt();
 */
export function useAccessibleIt() {
  originalIt ??= it;
  it = aIt;
}
