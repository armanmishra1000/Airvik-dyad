"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomTypesDataTable } from "./components/data-table";

/**
 * Renders the rooms page showing a table of room types sourced from the data context.
 *
 * @returns The React element containing a RoomTypesDataTable populated with `roomTypes`.
 */
export default function RoomsPage() {
  const { roomTypes } = useDataContext();
  return (
    <div className="space-y-6">
      <RoomTypesDataTable columns={columns} data={roomTypes} />
    </div>
  );
}