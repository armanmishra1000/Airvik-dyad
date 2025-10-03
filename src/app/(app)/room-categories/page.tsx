"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomCategoriesDataTable } from "./components/data-table";

/**
 * Display the Room Categories page with a data table of room categories.
 *
 * The component reads `roomCategories` from the data context and renders a container
 * with a RoomCategoriesDataTable using the imported `columns` configuration.
 *
 * @returns The JSX element for the Room Categories page containing the populated data table.
 */
export default function RoomCategoriesPage() {
  const { roomCategories } = useDataContext();
  return (
    <div className="space-y-4">
      <RoomCategoriesDataTable columns={columns} data={roomCategories} />
    </div>
  );
}