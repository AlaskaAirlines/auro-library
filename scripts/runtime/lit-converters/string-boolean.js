export const StringBoolean = {
  fromAttribute: (value) => {
    if (value === null || value === undefined) return false;
    if (value === "") return true;
    return String(value).trim().toLowerCase() === "true";
  },
  toAttribute: (value) => (value ? "" : null),
};
