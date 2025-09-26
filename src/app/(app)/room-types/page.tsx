"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomTypesDataTable } from "./components/data-table";

export default function RoomsPage() {
  const { roomTypes } = useDataContext();
  return (
    <div className="space-y-4">
      <RoomTypesDataTable columns={columns} data={roomTypes} />
    </div>
  );
}