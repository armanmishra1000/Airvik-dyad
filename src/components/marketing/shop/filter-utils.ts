import type { ShopFilters } from './FiltersSheet';

export const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000];

export const createDefaultFilters = (): ShopFilters => ({
  categories: [],
  priceRange: [...DEFAULT_PRICE_RANGE] as [number, number],
  attributes: [],
  rating: 'any',
});
