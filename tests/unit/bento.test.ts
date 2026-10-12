import { describe, expect, it } from 'vitest';
import { bentoSpans } from '../../src/lib/bento';

// Cells used after the hero's two rows at lg must be a multiple of 4.
function lgRest(singles: number, featured: boolean) {
  const s = bentoSpans(singles, featured);
  const rest = Math.max(0, singles - 2);
  let cells = 0;
  if (rest === 2) cells += s.terminalLg;
  if (rest >= 1) cells += s.contactLg;
  if (featured) cells += s.featuredLg;
  return cells;
}

describe('bentoSpans', () => {
  it.each([2, 3, 4])('fills lg rows with %i singles, with and without featured', (n) => {
    expect(lgRest(n, true) % 4).toBe(0);
    expect(lgRest(n, false) % 4).toBe(0);
  });

  it('keeps every tile 1x1 when all tiles exist', () => {
    expect(bentoSpans(4, true)).toEqual({
      contactSm: 1,
      contactLg: 1,
      terminalLg: 1,
      featuredLg: 2,
    });
  });

  it('widens contact in the 2-column grid when singles are odd', () => {
    expect(bentoSpans(3, true).contactSm).toBe(2);
    expect(bentoSpans(2, true).contactSm).toBe(1);
  });

  it('makes featured full width when it is alone on its row', () => {
    expect(bentoSpans(2, true).featuredLg).toBe(4);
  });
});
