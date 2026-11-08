import { describe, expect, it } from "vitest";
import {
  formatCo2,
  isApplianceId,
  isFinishBy,
  nextOccurrence,
  resolveAppliance,
} from "../src/utils/appliances";

describe("resolveAppliance", () => {
  it("uses the preset for fixed appliances", () => {
    expect(resolveAppliance("washing-machine")).toEqual({
      id: "washing-machine",
      label: "Washing machine",
      kwh: 1,
      slots: 4,
    });
  });

  it("works out EV energy from charging hours at 7 kW", () => {
    expect(resolveAppliance("ev", { hours: 4 })).toMatchObject({ kwh: 28, slots: 8 });
    expect(resolveAppliance("ev", { hours: 99 })).toMatchObject({ kwh: 56, slots: 16 });
  });

  it("rounds custom run times up to whole half hours", () => {
    expect(resolveAppliance("custom", { kwh: 3, hours: 1.2 })).toMatchObject({
      kwh: 3,
      slots: 3,
    });
  });

  it("falls back to sensible values for bad input", () => {
    expect(resolveAppliance("custom", { kwh: NaN, hours: NaN })).toMatchObject({
      kwh: 0.01,
      slots: 1,
    });
  });
});

describe("guards", () => {
  it("recognise valid URL values only", () => {
    expect(isApplianceId("ev")).toBe(true);
    expect(isApplianceId("toaster")).toBe(false);
    expect(isApplianceId(null)).toBe(false);
    expect(isFinishBy("07:00")).toBe(true);
    expect(isFinishBy("08:00")).toBe(false);
  });
});

describe("nextOccurrence", () => {
  it("treats a malformed time as midnight rather than NaN", () => {
    const now = new Date(2026, 4, 16, 22, 0);
    expect(nextOccurrence("", now)).toEqual(new Date(2026, 4, 17, 0, 0));
  });

  it("is later today if the time hasn't passed", () => {
    const now = new Date(2026, 4, 16, 5, 0);
    expect(nextOccurrence("07:00", now)).toEqual(new Date(2026, 4, 16, 7, 0));
  });

  it("is tomorrow if the time has passed", () => {
    const now = new Date(2026, 4, 16, 22, 0);
    expect(nextOccurrence("07:00", now)).toEqual(new Date(2026, 4, 17, 7, 0));
  });
});

describe("formatCo2", () => {
  it("picks sensible units and precision", () => {
    expect(formatCo2(4.44)).toBe("4.4 g");
    expect(formatCo2(312.6)).toBe("313 g");
    expect(formatCo2(1234)).toBe("1.2 kg");
  });
});
