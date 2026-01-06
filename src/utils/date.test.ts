import { describe, expect, it } from "vitest";
import { parseLocalDate, toLocalISODate } from "./date";

describe("date utils", () => {
  it("formats local dates as YYYY-MM-DD without timezone shifts", () => {
    const date = new Date(2026, 0, 7, 12, 0, 0); // Jan 7, 2026 at noon local
    expect(toLocalISODate(date)).toBe("2026-01-07");
  });

  it("parses date-only strings as local midnight", () => {
    const date = parseLocalDate("2026-01-07");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0); // January
    expect(date.getDate()).toBe(7);
  });

  it("handles edge case at midnight", () => {
    const date = new Date(2026, 0, 1, 0, 0, 0); // Jan 1, 2026 at midnight local
    expect(toLocalISODate(date)).toBe("2026-01-01");
  });

  it("roundtrips correctly", () => {
    const original = "2026-06-15";
    const parsed = parseLocalDate(original);
    const formatted = toLocalISODate(parsed);
    expect(formatted).toBe(original);
  });
});
