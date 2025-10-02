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
import { RolesDataTable } from "./roles-data-table";
import { columns } from "./roles-columns";

/**
 * Render the "Roles & Permissions" card containing the roles data table.
 *
 * Retrieves roles from the data context and displays them inside a Card
 * with a title, description, and the RolesDataTable configured with the
 * imported columns.
 *
 * @returns A JSX element containing the card UI with the roles table.
 */
export function RolesPermissions() {
  const { roles } = useDataContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles & Permissions</CardTitle>
        <CardDescription>
          Define roles and assign specific permissions to them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RolesDataTable columns={columns} data={roles} />
      </CardContent>
    </Card>
  );
}