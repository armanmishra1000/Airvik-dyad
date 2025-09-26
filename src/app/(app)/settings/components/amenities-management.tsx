"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppContext } from "@/context/app-context";
import { AmenitiesDataTable } from "./amenities-data-table";
import { columns } from "./amenities-columns";

export function AmenitiesManagement() {
  const { amenities } = useAppContext();

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