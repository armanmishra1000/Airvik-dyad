"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomsDataTable } from "./components/data-table";

export default function RoomsPage() {
  const { rooms } = useDataContext();

  return (
    <div className="space-y-4">
      <RoomsDataTable columns={columns} data={rooms} />
    </div>
  );
}