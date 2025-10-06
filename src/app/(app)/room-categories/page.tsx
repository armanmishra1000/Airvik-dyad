"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomCategoriesDataTable } from "./components/data-table";

export default function RoomCategoriesPage() {
  const { roomCategories } = useDataContext();
  return (
    <div className="space-y-6">
      <RoomCategoriesDataTable columns={columns} data={roomCategories} />
    </div>
  );
}