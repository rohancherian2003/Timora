import { describe, it, expect } from 'vitest';
import {
  calcRectangularCFT,
  calcRoundLogCFT,
  calcKeralaHoppusGirthCFT,
  cftToM3,
  m3ToCft,
  validateIndianPhone,
  validatePin,
} from '../index.js';

describe('Timber Calculator Unit Tests', () => {
  it('calculates rectangular CFT accurately according to Kerala formula', () => {
    // 10ft length, 6in width, 2in thickness, 1 piece
    // (10 * 6 * 2) / 144 = 120 / 144 = 0.8333 CFT
    const result = calcRectangularCFT({
      length_ft: 10,
      width_in: 6,
      thickness_in: 2,
      pieces: 1,
      price_per_cft: 2000,
    });

    expect(result.cft_per_piece).toBe(0.8333);
    expect(result.total_cft).toBe(0.8333);
    expect(result.estimated_cost).toBe(1666.67);
    expect(result.is_approximate).toBe(false);
  });

  it('handles multiple pieces accurately', () => {
    // 5 pieces of 10ft x 6in x 2in
    // 0.83333... * 5 = 4.1667 CFT
    const result = calcRectangularCFT({
      length_ft: 10,
      width_in: 6,
      thickness_in: 2,
      pieces: 5,
      price_per_cft: 1000,
    });

    expect(result.total_cft).toBe(4.1667);
    expect(result.estimated_cost).toBe(4166.67);
  });

  it('rejects zero or negative dimensions', () => {
    expect(() =>
      calcRectangularCFT({
        length_ft: 0,
        width_in: 6,
        thickness_in: 2,
        pieces: 1,
      })
    ).toThrow();
  });

  it('calculates round log Hoppus CFT and marks as approximate', () => {
    // 12 inch diameter, 10 ft length
    // (12^2 * 10) / 183.35 = 1440 / 183.35 = 7.8538 CFT
    const result = calcRoundLogCFT({
      diameter_in: 12,
      length_ft: 10,
      price_per_cft: 1500,
    });

    expect(result.total_cft).toBe(7.8538);
    expect(result.is_approximate).toBe(true);
  });

  it('calculates Kerala Quarter-Girth Hoppus CFT accurately according to standard ((G/4)²) * L / 144', () => {
    // Girth = 48 inches (Quarter girth = 12 inches), Length = 12 feet, 1 log
    // ((48 / 4)^2 * 12) / 144 = (144 * 12) / 144 = 12.0 CFT
    const result = calcKeralaHoppusGirthCFT({
      girth_in: 48,
      length_ft: 12,
      pieces: 1,
      price_per_cft: 2500,
    });

    expect(result.cft_per_piece).toBe(12);
    expect(result.total_cft).toBe(12);
    expect(result.estimated_cost).toBe(30000);
    expect(result.formula_used).toBe('CFT = ((Girth/4)²) × (Length/144)');
    expect(result.is_approximate).toBe(true);
  });

  it('converts between CFT and cubic meters accurately', () => {
    expect(cftToM3(35.3147)).toBeCloseTo(1.0, 3);
    expect(m3ToCft(1.0)).toBeCloseTo(35.3147, 3);
  });
});

describe('Validation Helpers', () => {
  it('validates 10-digit Indian phone numbers', () => {
    expect(validateIndianPhone('9847123456').valid).toBe(true);
    expect(validateIndianPhone('+919847123456').valid).toBe(true);
    expect(validateIndianPhone('123456').valid).toBe(false);
    expect(validateIndianPhone('0847123456').valid).toBe(false);
  });

  it('validates 6-digit PIN and rejects trivial pins', () => {
    expect(validatePin('739201').valid).toBe(true);
    expect(validatePin('123456').valid).toBe(false);
    expect(validatePin('000000').valid).toBe(false);
    expect(validatePin('1234').valid).toBe(false);
  });
});
