"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { GuestsDataTable } from "./components/data-table";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";

export default function GuestsPage() {
  const { guests, isDataLoading } = useDataContext();

  if (isDataLoading) {
    return <DataTableSkeleton columnCount={4} />;
  }

  return (
    <div className="space-y-4">
      <GuestsDataTable columns={columns} data={guests} />
    </div>
  );
}