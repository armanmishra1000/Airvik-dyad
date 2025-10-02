"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { GuestsDataTable } from "./components/data-table";

export default function GuestsPage() {
  const { guests } = useDataContext();

  return (
    <div className="space-y-4">
      <GuestsDataTable columns={columns} data={guests} />
    </div>
  );
}