import { describe, it, expect } from 'vitest';
import { parseNumber, round2, nearlyEqual } from '../src/engine/number.js';

describe('parseNumber (format Indonesia)', () => {
  it.each([
    ['12.000', 12000],
    ['12000', 12000],
    ['Rp20.000', 20000],
    ['Rp 1.500.000', 1500000],
    ['26,67', 26.67],
    ['1.500,5', 1500.5],
    ['2.5', 2.5],
    [' 75 ', 75],
    [98000, 98000],
  ])('%s → %s', (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it.each(['', 'abc', '1,2,3', '12.0.0', null, undefined, NaN])('menolak %s', (input) => {
    expect(parseNumber(input)).toBeNull();
  });
});

describe('round2 & nearlyEqual', () => {
  it('membulatkan setengah ke atas', () => {
    expect(round2(3.125)).toBe(3.13);
    expect(round2(26.666)).toBe(26.67);
  });
  it('toleransi 0,01', () => {
    expect(nearlyEqual(26.67, 80 / 3)).toBe(true);
    expect(nearlyEqual(26.6, 80 / 3)).toBe(false);
  });
});
