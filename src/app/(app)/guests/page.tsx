"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { GuestsDataTable } from "./components/data-table";

/**
 * Renders the guests page containing a data table of guests from context.
 *
 * @returns A JSX element with a GuestsDataTable component populated using the `guests` value from data context.
 */
export default function GuestsPage() {
  const { guests } = useDataContext();

  return (
    <div className="space-y-4">
      <GuestsDataTable columns={columns} data={guests} />
    </div>
  );
}