"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomsDataTable } from "./components/data-table";
import { PermissionGate } from "@/components/admin/permission-gate";

export default function RoomsPage() {
  const { rooms } = useDataContext();

  return (
    <PermissionGate feature="rooms">
      <div className="space-y-6">
        <RoomsDataTable columns={columns} data={rooms} />
      </div>
    </PermissionGate>
  );
}
