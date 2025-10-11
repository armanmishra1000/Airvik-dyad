"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RatePlansDataTable } from "./components/data-table";

export default function RatesPage() {
  const { ratePlans } = useDataContext();

  return (
    <div className="space-y-6">
      <RatePlansDataTable columns={columns} data={ratePlans} />
    </div>
  );
}
