/**
 * Generates a v4 UUID with a three-tier fallback for insecure contexts.
 *
 * Tier 1 (secure contexts): crypto.randomUUID() — native, fully random.
 * Tier 2 (insecure contexts): crypto.getRandomValues() — available on all
 *   modern browsers regardless of secure-context status.
 * Tier 3 (last resort, no crypto API): new Date().getTime() — lower entropy,
 *   but sufficient for element IDs where collision risk is negligible.
 *
 * See: https://w3c.github.io/webcrypto/#dom-crypto-randomuuid (secure-context restriction)
 */
export function generateUUID() {
  let uuid;

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    uuid = crypto.randomUUID();
  } else if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
    uuid = `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  } else {
    let d = new Date().getTime();
    uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (d % 16) | 0;
      d = (d - r) / 16 || new Date().getTime();
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // CSS selectors require IDs starting with a letter; replace a leading digit with 'a'.
  return /^[0-9]/.test(uuid) ? `a${uuid.slice(1)}` : uuid;
}
