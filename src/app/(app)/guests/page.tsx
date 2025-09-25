import { mockGuests } from "@/data";
import { columns } from "./components/columns";
import { GuestsDataTable } from "./components/data-table";

export default function GuestsPage() {
  return (
    <div className="space-y-4">
      <GuestsDataTable columns={columns} data={mockGuests} />
    </div>
  );
}