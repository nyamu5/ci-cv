import { describe, expect, it } from "vitest";
import { estimateCost } from "@/lib/costs";

describe("estimateCost", () => {
  it("computes gpt-4o-mini for 1000 input / 500 output", () => {
    // (1000 / 1e6) * 0.15 + (500 / 1e6) * 0.60 = 0.00015 + 0.0003 = 0.00045
    expect(estimateCost(1000, 500, "gpt-4o-mini")).toBe(0.00045);
  });

  it("computes gpt-4o for 1000 input / 500 output", () => {
    // (1000 / 1e6) * 2.50 + (500 / 1e6) * 10.00 = 0.0025 + 0.005 = 0.0075
    expect(estimateCost(1000, 500, "gpt-4o")).toBe(0.0075);
  });

  it("throws on an unknown model", () => {
    expect(() => estimateCost(100, 100, "gpt-5-turbo-quantum")).toThrow(
      /Unknown model/,
    );
  });

  it("returns 0 for zero tokens", () => {
    expect(estimateCost(0, 0, "gpt-4o")).toBe(0);
  });
});
