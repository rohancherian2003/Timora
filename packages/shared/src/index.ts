// Types
export * from './types/index.js';

// Utils
export * from './utils/calculator.js';
export * from './utils/validation.js';
export * from './utils/formatters.js';

// Constants
export const KERALA_DISTRICTS_COUNT = 14;
export const TIMBER_SPECIES_SLUGS = [
  'teak', 'mahogany', 'anjili', 'rubberwood',
  'mango', 'jackfruit', 'rosewood', 'coconut',
] as const;

export const TIMBER_TYPE_SLUGS = [
  'round_log', 'rough_sawn_plank', 'squared_beam', 'firewood',
] as const;

export const MAX_LISTING_IMAGES = 8;
export const MIN_LISTING_IMAGES = 1;
export const IMAGE_MAX_SIZE_MB = 10;

export const FREE_TIER_MONTHLY_CONTACTS = 5; // future premium gate
