'use client';

import { useCallback, useEffect, useState } from 'react';

import { FiltersSheet, ShopFilters } from './FiltersSheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ShopFiltersToolbarProps = {
  filters: ShopFilters;
  onFiltersChange: (next: ShopFilters) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  createDefaultFilters: () => ShopFilters;
};

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest Arrivals', value: 'newest' },
];

const cloneFilters = (source: ShopFilters): ShopFilters => ({
  ...source,
  categories: [...source.categories],
  attributes: [...source.attributes],
  priceRange: [...source.priceRange] as [number, number],
});

export function ShopFiltersToolbar({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  createDefaultFilters,
}: ShopFiltersToolbarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<ShopFilters>(() => cloneFilters(filters));

  useEffect(() => {
    if (isFiltersOpen) {
      setPendingFilters(cloneFilters(filters));
    }
  }, [isFiltersOpen, filters]);

  const handleApply = useCallback(() => {
    onFiltersChange(cloneFilters(pendingFilters));
    setIsFiltersOpen(false);
  }, [onFiltersChange, pendingFilters]);

  const handleClearAll = useCallback(() => {
    const resetFilters = cloneFilters(createDefaultFilters());
    setPendingFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsFiltersOpen(false);
  }, [createDefaultFilters, onFiltersChange]);

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full items-center justify-between gap-8">
        <FiltersSheet
          isOpen={isFiltersOpen}
          onOpenChange={setIsFiltersOpen}
          pendingFilters={pendingFilters}
          onPendingFiltersChange={setPendingFilters}
          onApply={handleApply}
          onClearAll={handleClearAll}
        />

        <div className="flex w-full max-w-xs items-center gap-2 sm:max-w-none sm:w-auto">
          <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => {
              onSortChange(value);
            }}
          >
            <SelectTrigger className="w-full lg:min-w-[160px] rounded-xl border-border/60 bg-background text-sm">
              <SelectValue placeholder="Featured" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-background">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
