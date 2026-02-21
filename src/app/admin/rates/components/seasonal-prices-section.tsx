"use client";

import * as React from "react";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataContext } from "@/context/data-context";
import { useAuthContext } from "@/context/auth-context";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { SeasonalPriceFormDialog } from "./seasonal-price-form-dialog";

export function SeasonalPricesSection() {
  const { seasonalPrices, roomTypes, deleteSeasonalPrice } = useDataContext();
  const { hasPermission } = useAuthContext();
  const formatCurrency = useCurrencyFormatter();

  const roomTypeNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    roomTypes.forEach((rt) => map.set(rt.id, rt.name));
    return map;
  }, [roomTypes]);

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteSeasonalPrice(id);
      toast.success(`Deleted seasonal price "${name}"`);
    } catch {
      toast.error("Failed to delete seasonal price");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Seasonal Prices</h2>
        {hasPermission("create:rate_plan") && (
          <SeasonalPriceFormDialog>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Seasonal Price
            </Button>
          </SeasonalPriceFormDialog>
        )}
      </div>
      {seasonalPrices.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No seasonal prices configured. Add one to override room type prices for specific date ranges.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price / Night</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasonalPrices.map((sp) => (
                <TableRow key={sp.id}>
                  <TableCell>
                    {roomTypeNameMap.get(sp.roomTypeId) ?? "Unknown"}
                  </TableCell>
                  <TableCell>{sp.name}</TableCell>
                  <TableCell>{formatCurrency(sp.price)}</TableCell>
                  <TableCell>
                    {format(new Date(sp.startDate + "T00:00:00"), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(sp.endDate + "T00:00:00"), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {hasPermission("update:rate_plan") && (
                        <SeasonalPriceFormDialog seasonalPrice={sp}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </SeasonalPriceFormDialog>
                      )}
                      {hasPermission("delete:rate_plan") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(sp.id, sp.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
