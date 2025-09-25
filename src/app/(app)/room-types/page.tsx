"use client";

import { useAppContext } from "@/context/app-context";
import { columns } from "./components/columns";
import { RoomTypesDataTable } from "./components/data-table";

export default function RoomsPage() {
  const { roomTypes } = useAppContext();
  return (
    <div className="space-y-4">
      <RoomTypesDataTable columns={columns} data={roomTypes} />
    </div>
  );
}