/* eslint-disable */
export const StringBoolean = {
  fromAttribute: (value) => {
    if (value === null || value === undefined) return false;
    if (value === '') return true;
    return value.toLowerCase() !== 'false';
  },
  toAttribute: (value) => (value ? '' : null),
};