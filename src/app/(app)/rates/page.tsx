"use client";

import { useAppContext } from "@/context/app-context";
import { columns } from "./components/columns";
import { RatePlansDataTable } from "./components/data-table";

export default function RatesPage() {
  const { ratePlans } = useAppContext();

  return (
    <div className="space-y-4">
      <RatePlansDataTable columns={columns} data={ratePlans} />
    </div>
  );
}