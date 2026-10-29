import type {
  TimberCalcInput,
  TimberCalcResult,
  RoundLogCalcInput,
  KeralaHoppusGirthInput,
} from '../types/index.js';

/**
 * Kerala standard rectangular timber volume formula.
 *
 * CFT per piece = (Length_ft × Width_in × Thickness_in) / 144
 *
 * This is the industry-standard formula used in Kerala timber trade.
 * Dimensions: length in feet, width and thickness in inches.
 */
export function calcRectangularCFT(input: TimberCalcInput): TimberCalcResult {
  if (input.length_ft <= 0 || input.width_in <= 0 || input.thickness_in <= 0 || input.pieces <= 0) {
    throw new Error('All dimensions and piece count must be positive numbers.');
  }

  // Avoid floating-point accumulation by computing in one expression
  const cft_per_piece = (input.length_ft * input.width_in * input.thickness_in) / 144;
  const total_cft = cft_per_piece * input.pieces;
  const total_cft_m3 = total_cft * CFT_TO_M3;

  return {
    cft_per_piece: round4(cft_per_piece),
    total_cft: round4(total_cft),
    total_cft_m3: round4(total_cft_m3),
    estimated_cost:
      input.price_per_cft != null && input.price_per_cft > 0
        ? round2(total_cft * input.price_per_cft)
        : null,
    formula_used: 'CFT = (L_ft × W_in × T_in) / 144 × pieces',
    is_approximate: false,
  };
}

/**
 * Round log volume using the Hoppus formula (approximate).
 *
 * Hoppus CFT = (D_in² × L_ft) / 183.35
 *
 * D_in = average mid-point diameter in inches (under bark).
 * Result is labelled as approximate because it accounts for taper
 * and bark in a traditional way that may differ from actual solid volume.
 *
 * @see https://en.wikipedia.org/wiki/Hoppus_measure
 */
export function calcRoundLogCFT(input: RoundLogCalcInput): TimberCalcResult {
  if (input.diameter_in <= 0 || input.length_ft <= 0) {
    throw new Error('Diameter and length must be positive numbers.');
  }

  const cft_per_piece = (input.diameter_in * input.diameter_in * input.length_ft) / 183.35;
  const total_cft = cft_per_piece; // single log
  const total_cft_m3 = total_cft * CFT_TO_M3;

  return {
    cft_per_piece: round4(cft_per_piece),
    total_cft: round4(total_cft),
    total_cft_m3: round4(total_cft_m3),
    estimated_cost:
      input.price_per_cft != null && input.price_per_cft > 0
        ? round2(total_cft * input.price_per_cft)
        : null,
    formula_used: 'Hoppus CFT = (D_in² × L_ft) / 183.35',
    is_approximate: true,
  };
}

/**
 * Kerala Forest Department & Timber Trade Standard Quarter-Girth Hoppus Formula:
 * CFT = ((girth_in / 4)²) × (length_ft / 144) × pieces
 *
 * @param input KeralaHoppusGirthInput
 * @returns TimberCalcResult
 */
export function calcKeralaHoppusGirthCFT(input: KeralaHoppusGirthInput): TimberCalcResult {
  const pieces = input.pieces != null && input.pieces > 0 ? input.pieces : 1;
  if (input.girth_in <= 0 || input.length_ft <= 0) {
    throw new Error('Girth and length must be positive numbers.');
  }

  const quarter_girth = input.girth_in / 4;
  const cft_per_piece = (quarter_girth * quarter_girth * input.length_ft) / 144;
  const total_cft = cft_per_piece * pieces;
  const total_cft_m3 = total_cft * CFT_TO_M3;

  return {
    cft_per_piece: round4(cft_per_piece),
    total_cft: round4(total_cft),
    total_cft_m3: round4(total_cft_m3),
    estimated_cost:
      input.price_per_cft != null && input.price_per_cft > 0
        ? round2(total_cft * input.price_per_cft)
        : null,
    formula_used: 'CFT = ((Girth/4)²) × (Length/144)',
    is_approximate: true,
  };
}

// ─── Unit conversions ─────────────────────────────────────────────────────────

/** 1 cubic foot = 0.0283168 cubic metres (exact) */
export const CFT_TO_M3 = 0.0283168;

/** 1 cubic metre = 35.3147 cubic feet */
export const M3_TO_CFT = 35.3147;

/** 1 foot = 0.3048 metres */
export const FT_TO_M = 0.3048;

/** 1 inch = 2.54 centimetres */
export const IN_TO_CM = 2.54;

export function cftToM3(cft: number): number {
  return round4(cft * CFT_TO_M3);
}

export function m3ToCft(m3: number): number {
  return round4(m3 * M3_TO_CFT);
}

export function feetToMetres(ft: number): number {
  return round4(ft * FT_TO_M);
}

export function inchesToCm(inches: number): number {
  return round4(inches * IN_TO_CM);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Round to 4 decimal places for volume (display rounds further if needed) */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Round to 2 decimal places for currency (₹) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
