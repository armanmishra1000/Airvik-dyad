"use client";

import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { RoomCategoriesDataTable } from "./components/data-table";

/**
 * Renders the Room Categories page by reading room category data from context and displaying it in a data table.
 *
 * The component obtains `roomCategories` from the shared data context and passes them, along with the table
 * column configuration, to the RoomCategoriesDataTable component.
 *
 * @returns A container element that renders the room categories data table populated with the current context data.
 */
export default function RoomCategoriesPage() {
  const { roomCategories } = useDataContext();
  return (
    <div className="space-y-6">
      <RoomCategoriesDataTable columns={columns} data={roomCategories} />
    </div>
  );
}