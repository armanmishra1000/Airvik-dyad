"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomsDataTable } from "./components/data-table";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";

export default function RoomsPage() {
  const { rooms, isDataLoading } = useDataContext();

  if (isDataLoading) {
    return <DataTableSkeleton columnCount={5} />;
  }

  return (
    <div className="space-y-4">
      <RoomsDataTable columns={columns} data={rooms} />
    </div>
  );
}