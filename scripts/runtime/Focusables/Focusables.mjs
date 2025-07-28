// Selectors for focusable elements
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[role="tab"]:not([disabled])',
  '[role="link"]:not([disabled])',
  '[role="button"]:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([contenteditable="false"])'
];

// List of custom components that are known to be focusable
export const FOCUSABLE_COMPONENTS = [
  'auro-checkbox',
  'auro-radio',
  'auro-dropdown',
  'auro-button',
  'auro-combobox',
  'auro-input',
  'auro-counter',
  // 'auro-menu', // Auro menu is not focusable by default, it uses a different interaction model
  'auro-select',
  'auro-datepicker',
  'auro-hyperlink',
  'auro-accordion',
];

/**
 * Determines if a given element is a custom focusable component.
 * Returns true if the element matches a known focusable component and is not disabled.
 *
 * @param {HTMLElement} element The element to check for focusability.
 * @returns {boolean} True if the element is a focusable custom component, false otherwise.
 */
export function isFocusableComponent(element) {
  const componentName = element.tagName.toLowerCase();

  // Guard Clause: Element is a focusable component
  if (!FOCUSABLE_COMPONENTS.some((name) => element.hasAttribute(name) || componentName === name)) return false;

  // Guard Clause: Element is not disabled
  if (element.hasAttribute('disabled')) return false;

  // Guard Clause: The element is a hyperlink and has no href attribute
  if (componentName.match("hyperlink") && !element.hasAttribute('href')) return false;

  // If all guard clauses pass, the element is a focusable component
  return true;
}

/**
 * Retrieves all focusable elements within the container in DOM order, including those in shadow DOM and slots.
 * Returns a unique, ordered array of elements that can receive focus.
 * Also sorts elements with tabindex first, preserving their order.
 *
 * @param {HTMLElement} container The container to search within
 * @returns {Array<HTMLElement>} An array of focusable elements within the container.
 */
export function getFocusableElements(container) {
  // Get elements in DOM order by walking the tree
  const orderedFocusableElements = [];

  // Define a recursive function to collect focusable elements in DOM order
  const collectFocusableElements = (root) => {
    // Check if current element is focusable
    if (root.nodeType === Node.ELEMENT_NODE) {
      // Check if this is a custom component that is focusable
      const isComponentFocusable = isFocusableComponent(root);

      if (isComponentFocusable) {
        // Add the component itself as a focusable element and don't traverse its shadow DOM
        orderedFocusableElements.push(root);
        return; // Skip traversing inside this component
      }

      // Check if the element itself matches any selector
      for (const selector of FOCUSABLE_SELECTORS) {
        if (root.matches?.(selector)) {
          orderedFocusableElements.push(root);
          break; // Once we know it's focusable, no need to check other selectors
        }
      }

      // Process shadow DOM only for non-Auro components
      if (root.shadowRoot) {
        // Process shadow DOM children in order
        if (root.shadowRoot.children) {
          Array.from(root.shadowRoot.children).forEach(child => {
            collectFocusableElements(child);
          });
        }
      }

      // Process slots and their assigned nodes in order
      if (root.tagName === 'SLOT') {
        const assignedNodes = root.assignedNodes({ flatten: true });
        for (const node of assignedNodes) {
          collectFocusableElements(node);
        }
      } else {
        // Process light DOM children in order
        if (root.children) {
          Array.from(root.children).forEach(child => {
            collectFocusableElements(child);
          });
        }
      }
    }
  };

  // Start the traversal from the container
  collectFocusableElements(container);

  // Remove duplicates that might have been collected through different paths
  // while preserving order
  const uniqueElements = [];
  const seen = new Set();

  for (const element of orderedFocusableElements) {
    if (!seen.has(element)) {
      seen.add(element);
      uniqueElements.push(element);
    }
  }

  // Move tab-indexed elements to the front while preserving their order
  // This ensures that elements with tabindex are prioritized in the focus order

  // First extract elements with tabindex
  const elementsWithTabindex = uniqueElements.filter(el => el.hasAttribute('tabindex'));

  // Sort these elements by their tabindex value
  elementsWithTabindex.sort((a, b) => {
    return parseInt(a.getAttribute('tabindex'), 10) - parseInt(b.getAttribute('tabindex'), 10);
  });

  // Elements without tabindex (preserving their original order)
  const elementsWithoutTabindex = uniqueElements.filter(el => !el.hasAttribute('tabindex'));

  // Combine both arrays with tabindex elements first
  const tabIndexedUniqueElements = [
    ...elementsWithTabindex,
    ...elementsWithoutTabindex
  ];

  return tabIndexedUniqueElements;
}