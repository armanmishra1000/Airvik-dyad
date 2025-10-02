"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RatePlansDataTable } from "./components/data-table";

/**
 * Renders the Rates page containing a data table of rate plans.
 *
 * @returns A React element with a vertically spaced container that renders the rate plans data table.
 */
export default function RatesPage() {
  const { ratePlans } = useDataContext();

  return (
    <div className="space-y-4">
      <RatePlansDataTable columns={columns} data={ratePlans} />
    </div>
  );
}