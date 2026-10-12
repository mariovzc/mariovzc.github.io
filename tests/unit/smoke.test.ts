import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('runs vitest inside docker', () => {
    expect(process.env.DOCKER).toBe('1');
  });
});
