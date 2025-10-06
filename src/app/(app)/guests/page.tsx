"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { GuestsDataTable } from "./components/data-table";

/**
 * Renders the guests page with a data table populated from the data context.
 *
 * @returns The React element for the guests page.
 */
export default function GuestsPage() {
  const { guests } = useDataContext();

  return (
    <div className="space-y-6">
      <GuestsDataTable columns={columns} data={guests} />
    </div>
  );
}