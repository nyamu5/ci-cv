import { describe, expect, it } from "vitest";
import { isLikelyGarbled } from "@/lib/pdf";

describe("isLikelyGarbled", () => {
  it("returns false for a normal sentence", () => {
    const normal =
      "The quick brown fox jumps over the lazy dog. This is a normal CV summary with reasonable word lengths.";
    expect(isLikelyGarbled(normal)).toBe(false);
  });

  it("returns true for a garbled string (random chars, no spaces)", () => {
    const garbled = "xkjf923hdfk23FDF92fdf239fjf239fj239fjf239fjkdjfkdjfk";
    expect(isLikelyGarbled(garbled)).toBe(true);
  });

  it("handles an empty string without throwing", () => {
    expect(() => isLikelyGarbled("")).not.toThrow();
    expect(isLikelyGarbled("")).toBe(false);
  });
});
