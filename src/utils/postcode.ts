const OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/;
/** The inward part of a full postcode: a digit then two letters, e.g. "1AA". */
const INWARD = /\d[A-Z]{2}$/;

/**
 * Turns what someone typed into the outward half of a UK postcode, which is
 * all the Carbon Intensity API accepts. "sw1a 1aa" and "SW1A" both give
 * "SW1A". Returns null if it doesn't look like a postcode.
 */
export function toOutcode(input: string): string | null {
  const compact = input.trim().toUpperCase().replace(/\s+/g, "");
  if (!compact) return null;

  if (OUTCODE.test(compact)) return compact;

  if (compact.length > 3 && INWARD.test(compact)) {
    const outward = compact.slice(0, -3);
    if (OUTCODE.test(outward)) return outward;
  }

  return null;
}
