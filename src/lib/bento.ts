/** Column spans for the optional home bento tiles. */
export interface BentoSpans {
  /** Contact tile span in the 2-column (sm) grid. */
  contactSm: 1 | 2;
  /** Spans in the 4-column (lg) grid. */
  contactLg: 1 | 2 | 4;
  terminalLg: 1 | 2;
  featuredLg: 2 | 4;
}

/**
 * Layout: hero (2x2), headline (2x1), then `singles` 1x1 tiles in the order
 * stack?, years?, terminal, contact, then the 2x1 featured tile if present.
 * At lg the first two singles sit next to the hero's second row; spans of the
 * remaining tiles are widened so every row is full.
 */
export function bentoSpans(singles: number, hasFeatured: boolean): BentoSpans {
  const rest = Math.max(0, singles - 2); // singles left after the hero's second row
  return {
    contactSm: singles % 2 === 1 ? 2 : 1,
    contactLg: rest === 1 ? (hasFeatured ? 2 : 4) : rest === 2 && !hasFeatured ? 2 : 1,
    terminalLg: rest === 2 && !hasFeatured ? 2 : 1,
    featuredLg: rest === 0 ? 4 : 2,
  };
}
