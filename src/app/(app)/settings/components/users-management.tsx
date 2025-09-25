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
import { UsersDataTable } from "./users-data-table";
import { columns } from "./users-columns";

export function UsersManagement() {
  const { users } = useAppContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Manage your team members and their roles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsersDataTable columns={columns} data={users} />
      </CardContent>
    </Card>
  );
}