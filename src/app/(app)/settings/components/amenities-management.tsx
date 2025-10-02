"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDataContext } from "@/context/data-context";
import { AmenitiesDataTable } from "./amenities-data-table";
import { columns } from "./amenities-columns";

/**
 * Renders a management card for amenities.
 *
 * Displays a Card with a title, description, and a data table populated with amenities from the data context.
 *
 * @returns A JSX element containing the amenities management Card and its contents.
 */
export function AmenitiesManagement() {
  const { amenities } = useDataContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
        <CardDescription>
          Manage the amenities available for your room types.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AmenitiesDataTable columns={columns} data={amenities} />
      </CardContent>
    </Card>
  );
}