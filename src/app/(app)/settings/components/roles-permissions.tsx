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
import { RolesDataTable } from "./roles-data-table";
import { columns } from "./roles-columns";

export function RolesPermissions() {
  const { roles } = useAppContext();

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