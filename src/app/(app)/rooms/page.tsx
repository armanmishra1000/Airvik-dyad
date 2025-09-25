import { mockRoomTypes } from "@/data";
import { columns } from "./components/columns";
import { RoomTypesDataTable } from "./components/data-table";

export default function RoomsPage() {
  return (
    <div className="space-y-4">
      <RoomTypesDataTable columns={columns} data={mockRoomTypes} />
    </div>
  );
}