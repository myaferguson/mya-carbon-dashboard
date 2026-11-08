import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatClock,
  formatRelativeTime,
  formatTimeRange,
} from "../src/utils/formatTime";

// Build ISO strings from local times so the tests pass in any timezone.
const localIso = (hours: number, minutes: number): string =>
  new Date(2026, 4, 16, hours, minutes).toISOString();

describe("formatClock", () => {
  it("formats as a 24-hour HH:MM time", () => {
    expect(formatClock(localIso(9, 5))).toBe("09:05");
    expect(formatClock(localIso(17, 30))).toBe("17:30");
  });
});

describe("formatTimeRange", () => {
  it("joins two clock times with a dash", () => {
    expect(formatTimeRange(localIso(12, 0), localIso(12, 30))).toBe(
      "12:00-12:30",
    );
  });
});

describe("formatRelativeTime", () => {
  const now = new Date(2026, 4, 16, 12, 0);
  const ago = (ms: number): string =>
    new Date(now.getTime() - ms).toISOString();
  const MINUTE = 60 * 1000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for less than a minute ago", () => {
    expect(formatRelativeTime(ago(20 * 1000))).toBe("just now");
  });

  it("returns minutes for less than an hour ago", () => {
    expect(formatRelativeTime(ago(5 * MINUTE))).toBe("5 min ago");
  });

  it("returns hours for less than a day ago", () => {
    expect(formatRelativeTime(ago(60 * MINUTE))).toBe("1 hour ago");
    expect(formatRelativeTime(ago(3 * 60 * MINUTE))).toBe("3 hours ago");
  });

  it("returns the full date for a day or more ago", () => {
    const iso = ago(2 * 24 * 60 * MINUTE);
    expect(formatRelativeTime(iso)).toBe(new Date(iso).toLocaleString("en-GB"));
  });
});
