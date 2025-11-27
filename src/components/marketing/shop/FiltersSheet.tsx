'use client';

import { Dispatch, SetStateAction, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Menu } from 'lucide-react';
import { useCurrencyFormatter } from '@/hooks/use-currency';

export type ShopFilters = {
  categories: string[];
  priceRange: [number, number];
  attributes: string[];
  rating: string;
};

export const categoryOptions = [
  { label: 'All', value: 'all' },
  { label: 'Wellness Essentials', value: 'wellness' },
  { label: 'Home & Decor', value: 'home-decor' },
  { label: 'Textiles', value: 'textiles' },
  { label: 'Spiritual Gifts', value: 'gifts' },
];

export const attributeOptions = [
  { label: 'Handcrafted', value: 'handcrafted' },
  { label: 'Organic Cotton', value: 'organic-cotton' },
  { label: 'Brass', value: 'brass' },
  { label: 'Ayurvedic', value: 'ayurvedic' },
  { label: 'Limited Edition', value: 'limited' },
  { label: 'Eco-Friendly', value: 'eco' },
];

type FiltersSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pendingFilters: ShopFilters;
  onPendingFiltersChange: Dispatch<SetStateAction<ShopFilters>>;
  onApply: () => void;
  onClearAll: () => void;
};

export function FiltersSheet({
  isOpen,
  onOpenChange,
  pendingFilters,
  onPendingFiltersChange,
  onApply,
  onClearAll,
}: FiltersSheetProps) {
  const handleCategoryChange = useCallback(
    (value: string, checked: boolean | 'indeterminate') => {
      onPendingFiltersChange((current) => {
        const categories = new Set(current.categories);

        if (value === 'all') {
          if (checked === true) {
            return {
              ...current,
              categories: ['all'],
            };
          }

          return {
            ...current,
            categories: [],
          };
        }

        categories.delete('all');

        if (checked === true) {
          categories.add(value);
        } else {
          categories.delete(value);
        }

        return {
          ...current,
          categories: Array.from(categories),
        };
      });
    },
    [onPendingFiltersChange]
  );

  const handlePriceChange = useCallback(
    (value: number[]) => {
      const [min, max] = value as [number, number];
      onPendingFiltersChange((current) => ({
        ...current,
        priceRange: [min, max],
      }));
    },
    [onPendingFiltersChange]
  );

  const handleAttributesChange = useCallback(
    (values: string[]) => {
      onPendingFiltersChange((current) => ({
        ...current,
        attributes: values,
      }));
    },
    [onPendingFiltersChange]
  );

  const formatCurrency = useCurrencyFormatter();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="flex  max-w-xs items-center justify-center gap-2 rounded-xl border-border/60 bg-background px-3 lg:px-5 lg:py-2 text-sm font-medium text-foreground backdrop-blur sm:w-auto"
        >
          <Menu className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full max-w-md flex-col px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold text-foreground">Filters</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Tailor the collection to match your mood and moment.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Category</h3>
            <div className="space-y-3">
              {categoryOptions.map((option) => (
                <div key={option.value} className="flex items-center gap-3">
                  <Checkbox
                    id={`category-${option.value}`}
                    checked={
                      option.value === 'all'
                        ? pendingFilters.categories.includes('all') || pendingFilters.categories.length === 0
                        : pendingFilters.categories.includes(option.value)
                    }
                    onCheckedChange={(checked) => handleCategoryChange(option.value, checked)}
                  />
                  <Label htmlFor={`category-${option.value}`} className="text-sm text-foreground">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Price range</h3>
              <span className="text-xs font-medium text-muted-foreground">
                {`${formatCurrency(pendingFilters.priceRange[0])} - ${formatCurrency(pendingFilters.priceRange[1])}`}
              </span>
            </div>
            <Slider
              value={pendingFilters.priceRange}
              min={0}
              max={10000}
              step={50}
              onValueChange={handlePriceChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(10000)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Product details</h3>
            <ToggleGroup
              type="multiple"
              value={pendingFilters.attributes}
              onValueChange={handleAttributesChange}
              className="flex flex-wrap gap-2"
            >
              {attributeOptions.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="rounded-xl border border-border/50 bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <footer className="sticky bottom-0 bg-background pt-4">
          <Separator className="mb-4 border-border/50" />
          <div className="flex gap-2">
            <Button className="w-1/2" variant="ghost" onClick={onClearAll}>
              Clear All
            </Button>
            <Button className="w-1/2" onClick={onApply}>
              Apply
            </Button>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
