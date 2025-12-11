"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomCategoriesDataTable } from "./components/data-table";
import { PermissionGate } from "@/components/admin/permission-gate";

export default function RoomCategoriesPage() {
  const { roomCategories } = useDataContext();
  return (
    <PermissionGate feature="roomCategories">
      <div className="space-y-6">
        <RoomCategoriesDataTable columns={columns} data={roomCategories} />
      </div>
    </PermissionGate>
  );
}
