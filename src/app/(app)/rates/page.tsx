"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RatePlansDataTable } from "./components/data-table";

/**
 * Page component that renders the rate plans data table.
 *
 * @returns A React element containing a RatePlansDataTable populated with rate plans from application context.
 */
export default function RatesPage() {
  const { ratePlans } = useDataContext();

  return (
    <div className="space-y-6">
      <RatePlansDataTable columns={columns} data={ratePlans} />
    </div>
  );
}