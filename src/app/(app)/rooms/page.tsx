"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomsDataTable } from "./components/data-table";

/**
 * Render the Rooms page containing a table of room entries.
 *
 * The component reads `rooms` from the shared data context and renders a
 * RoomsDataTable with the imported `columns`.
 *
 * @returns A JSX element containing the rooms data table.
 */
export default function RoomsPage() {
  const { rooms } = useDataContext();

  return (
    <div className="space-y-6">
      <RoomsDataTable columns={columns} data={rooms} />
    </div>
  );
}