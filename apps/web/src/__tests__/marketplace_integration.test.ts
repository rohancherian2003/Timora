import { describe, it, expect } from 'vitest';
import { mapApiListingToItem, TIMBER_LISTINGS } from '../utils/timberListings';

describe('Marketplace API Integration & Data Mapping', () => {
  it('maps backend listing query row to frontend TimberListingItem seamlessly', () => {
    const mockBackendRow = {
      id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Premium Nilambur Teak Planks',
      species_name_en: 'Teak',
      species_name_ml: 'തേക്ക്',
      type_name_en: 'Rough-sawn Planks',
      type_name_ml: 'അറുത്ത പലകകൾ',
      district_name_en: 'Malappuram',
      district_name_ml: 'മലപ്പുറം',
      locality: 'Nilambur Yard',
      quantity: '45.5',
      unit: 'cft',
      price_per_cft: '2750',
      business_name: 'Nilambur Premium Woods',
      seller_phone: '+919847120001',
      seller_verified: 'APPROVED',
      length_ft: 12,
      width_in: 8,
      thickness_in: 2,
      pieces: 15,
      is_dried: true,
      moisture_pct: 12.5,
      images: [
        { id: 'img-1', url: '/images/timber/teak-logs.png', is_primary: true },
      ],
      description: 'First grade seasoned heartwood planks.',
    };

    const mapped = mapApiListingToItem(mockBackendRow);

    expect(mapped.id).toBe('a0000000-0000-0000-0000-000000000001');
    expect(mapped.title).toBe('Premium Nilambur Teak Planks');
    expect(mapped.species).toBe('Teak');
    expect(mapped.species_ml).toBe('തേക്ക്');
    expect(mapped.type).toBe('Rough-sawn Planks');
    expect(mapped.district).toBe('Malappuram (മലപ്പുറം)');
    expect(mapped.locality).toBe('Nilambur Yard');
    expect(mapped.quantity).toBe(45.5);
    expect(mapped.unit).toBe('CFT');
    expect(mapped.price_per_cft).toBe(2750);
    expect(mapped.seller_name).toBe('Nilambur Premium Woods');
    expect(mapped.seller_verified).toBe(true);
    expect(mapped.image_url).toBe('/images/timber/teak-logs.png');
    expect(mapped.dimensions).toBe('12 ft × 8 in × 2 in');
    expect(mapped.pieces).toBe(15);
    expect(mapped.moisture).toBe('12.5% Moisture');
  });

  it('handles empty image arrays with fallback defaults', () => {
    const minimalRow = {
      id: 'a0000000-0000-0000-0000-000000000002',
      title: 'Anjili Squared Beams',
      species: 'Anjili',
      type: 'Squared Beams',
      district: 'Kottayam',
      quantity: 20,
      price_per_cft: 1600,
      images: [],
    };

    const mapped = mapApiListingToItem(minimalRow);
    expect(mapped.image_url).toBe('/images/timber/teak-logs.png');
    expect(mapped.additional_images?.length).toBeGreaterThan(0);
    expect(mapped.unit).toBe('CFT');
    expect(mapped.price_per_cft).toBe(1600);
  });

  it('preserves initial offline listings count and integrity', () => {
    expect(TIMBER_LISTINGS.length).toBeGreaterThanOrEqual(5);
    const first = TIMBER_LISTINGS[0];
    expect(first?.species).toBe('Teak');
    expect(first?.seller_verified).toBe(true);
  });
});
