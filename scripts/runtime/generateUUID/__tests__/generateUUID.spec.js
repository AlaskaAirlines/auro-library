import { afterEach, describe, expect, it, vi } from "vitest";
import { generateUUID } from "../generateUUID.mjs";

const V4_UUID_REGEX =
  /^[a-f][0-9a-f]{7}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateUUID", () => {
  it("uses native crypto.randomUUID in a secure context", () => {
    const fakeId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    const spy = vi.spyOn(crypto, "randomUUID").mockReturnValue(fakeId);

    expect(generateUUID()).toBe(fakeId);
    expect(spy).toHaveBeenCalledOnce();
  });

  it("replaces a leading digit with 'a' so the id is valid in CSS selectors", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "1bcd1234-0000-4000-8000-000000000000",
    );

    expect(generateUUID()).toBe("abcd1234-0000-4000-8000-000000000000");
  });

  it("falls back to crypto.getRandomValues when randomUUID is unavailable", () => {
    vi.spyOn(crypto, "randomUUID", "get").mockReturnValue(undefined);
    const getRandomValuesSpy = vi.spyOn(crypto, "getRandomValues");

    const result = generateUUID();
    expect(result).toMatch(V4_UUID_REGEX);
    expect(getRandomValuesSpy).toHaveBeenCalledOnce();
  });

  it("falls back to timestamp+random when both randomUUID and getRandomValues are unavailable", () => {
    vi.spyOn(crypto, "randomUUID", "get").mockReturnValue(undefined);
    vi.spyOn(crypto, "getRandomValues", "get").mockReturnValue(undefined);

    const result = generateUUID();
    expect(result).toMatch(V4_UUID_REGEX);
  });
});
