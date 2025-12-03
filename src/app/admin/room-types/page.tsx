"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomTypesDataTable } from "./components/data-table";
import { PermissionGate } from "@/components/admin/permission-gate";

export default function RoomTypesPage() {
  const { roomTypes } = useDataContext();
  return (
    <PermissionGate feature="roomTypes">
      <div className="space-y-6">
        <RoomTypesDataTable columns={columns} data={roomTypes} />
      </div>
    </PermissionGate>
  );
}
