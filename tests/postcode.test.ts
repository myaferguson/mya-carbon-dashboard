import { describe, expect, it } from "vitest";
import { toOutcode } from "../src/utils/postcode";

describe("toOutcode", () => {
  it.each([
    ["SW1A 1AA", "SW1A"],
    ["sw1a1aa", "SW1A"],
    ["  M1 1AE ", "M1"],
    ["W1A 0AX", "W1A"],
    ["EH1", "EH1"],
    ["iv1", "IV1"],
    ["B33 8TH", "B33"],
  ])("turns %j into %j", (input, expected) => {
    expect(toOutcode(input)).toBe(expected);
  });

  it.each(["", "   ", "hello", "12345", "SW1A 1A", "ZZZZ 1AA"])(
    "rejects %j",
    (input) => {
      expect(toOutcode(input)).toBeNull();
    },
  );
});
