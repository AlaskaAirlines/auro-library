import { transportAttributes } from "./transportAttributes.mjs";

const _matchers = {
  'aria-': attr => attr.startsWith('aria-'),
  'role': attr => attr.match(/^role$/),
  'tabindex': attr => attr.match(/^tabindex$/),
};

/**
 * Transfers all ARIA attributes from the host element to the target element.
 * This function allows optional removal of the original attributes and the ability to ignore specific attributes.
 *
 * @param {Object} params - The parameters object.
 * @param {HTMLElement} params.host - The host element to observe.
 * @param {HTMLElement} params.target - The target element to receive attributes.
 * @param {boolean} [params.removeOriginal=true] - Whether to remove original attributes.
 * @param {Array<String>} [params.ignore] - The list of attributes not to transport.
 *
 * @returns {Function} Function to detach the specific matcher and target pairing.
 */

export const transportAriaAttributes = ({ host, target, removeOriginal = true, ignore = undefined }) => {
  return transportAttributes({
    host,
    target,
    match: attr => {
      if (ignore && ignore.includes(attr)) {
        return false;
      }
      return _matchers['aria-'](attr);
    },
    removeOriginal
  });
};

/**
 * Transfers the 'role' attribute from the host element to the target element.
 * This function can optionally remove the original attribute from the host after transport.
 *
 * @param {Object} params - The parameters object.
 * @param {HTMLElement} params.host - The host element to observe.
 * @param {HTMLElement} params.target - The target element to receive attributes.
 * @param {boolean} [params.removeOriginal=true] - Whether to remove original attributes.
 *
 * @returns {Function} Function to detach the specific matcher and target pairing.} param.
 */
export const transportRoleAttribute = ({ host, target, removeOriginal = true }) => {
  return transportAttributes({
    host,
    target,
    match: _matchers['role'],
    removeOriginal
  });
};

/**
 * Transfers the 'tabindex' attribute from the host element to the target element.
 * This function can optionally remove the original attribute from the host after transport.
 *
 * @param {Object} params - The parameters object.
 * @param {HTMLElement} params.host - The host element to observe.
 * @param {HTMLElement} params.target - The target element to receive attributes.
 * @param {boolean} [params.removeOriginal=true] - Whether to remove original attributes.
 *
 * @returns {Function} Function to detach the specific matcher and target pairing.} param.
 */
export const transportTabIndexAttribute = ({ host, target, removeOriginal = true }) => {
  return transportAttributes({
    host,
    target,
    match: _matchers['tabindex'],
    removeOriginal
  });
};

/**
 * Transfers all accessibility-related attributes (ARIA, role, tabindex) from the host element to the target element.
 * This function allows optional removal of the original attributes and the ability to ignore specific attributes.
 *
 * @param {Object} params - The parameters object.
 * @param {HTMLElement} params.host - The host element to observe.
 * @param {HTMLElement} params.target - The target element to receive attributes.
 * @param {boolean} [params.removeOriginal=true] - Whether to remove original attributes.
 * @param {Array<String>} [params.ignore] - The list of attributes not to transport.
 *
 * @returns {Function} Function to detach the specific matcher and target pairing.} param.
 */
export const transportAllA11yAttributes = ({ host, target, removeOriginal = true, ignore = undefined }) => {
  return transportAttributes({
    host,
    target,
    match: attr => {
      if (ignore && ignore.includes(attr)) {
        return false;
      }
      for (const key in _matchers) {
        if (_matchers[key](attr)) {
          return true;
        }
      }
      return false;
    },
    removeOriginal
  });
}
