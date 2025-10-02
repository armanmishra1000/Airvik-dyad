"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomsDataTable } from "./components/data-table";

/**
 * Renders the rooms page containing a table of rooms from application context.
 *
 * @returns A JSX element that displays the rooms data table inside a vertically spaced container.
 */
export default function RoomsPage() {
  const { rooms } = useDataContext();

  return (
    <div className="space-y-4">
      <RoomsDataTable columns={columns} data={rooms} />
    </div>
  );
}