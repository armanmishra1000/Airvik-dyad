"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RatePlansDataTable } from "./components/data-table";
import { PermissionGate } from "@/components/admin/permission-gate";

export default function RatesPage() {
  const { ratePlans } = useDataContext();

  return (
    <PermissionGate feature="ratePlans">
      <div className="space-y-6">
        <RatePlansDataTable columns={columns} data={ratePlans} />
      </div>
    </PermissionGate>
  );
}
