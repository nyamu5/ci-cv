import { describe, expect, it } from "vitest";
import { getIdentifier } from "@/lib/rate-limit";

function req(headers: Record<string, string>) {
  return new Request("http://localhost/", { headers });
}

describe("getIdentifier", () => {
  it("returns user:<id> when a userId is passed (ignores headers)", () => {
    const r = req({ "x-forwarded-for": "1.2.3.4" });
    expect(getIdentifier(r, "u-123")).toBe("user:u-123");
  });

  it("prefers x-forwarded-for first hop over x-real-ip", () => {
    const r = req({
      "x-forwarded-for": "10.0.0.1, 192.168.1.1",
      "x-real-ip": "5.5.5.5",
    });
    expect(getIdentifier(r)).toBe("anon:10.0.0.1");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const r = req({ "x-real-ip": "5.5.5.5" });
    expect(getIdentifier(r)).toBe("anon:5.5.5.5");
  });

  it("returns anon:unknown when neither header is present", () => {
    const r = req({});
    expect(getIdentifier(r)).toBe("anon:unknown");
  });
});
