import { mockRatePlans } from "@/data";
import { columns } from "./components/columns";
import { RatePlansDataTable } from "./components/data-table";

export default function RatesPage() {
  return (
    <div className="space-y-4">
      <RatePlansDataTable columns={columns} data={mockRatePlans} />
    </div>
  );
}