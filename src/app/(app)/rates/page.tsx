"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RatePlansDataTable } from "./components/data-table";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";

export default function RatesPage() {
  const { ratePlans, isDataLoading } = useDataContext();

  if (isDataLoading) {
    return <DataTableSkeleton columnCount={3} />;
  }

  return (
    <div className="space-y-4">
      <RatePlansDataTable columns={columns} data={ratePlans} />
    </div>
  );
}