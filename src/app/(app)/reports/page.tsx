import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { OccupancyReport } from "./components/occupancy-report";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate and view reports for your property.
        </p>
      </div>
      <Tabs defaultValue="occupancy" className="w-full">
        <TabsList>
          <TabsTrigger value="occupancy">Occupancy Report</TabsTrigger>
          <TabsTrigger value="revenue" disabled>
            Revenue (Coming Soon)
          </TabsTrigger>
          <TabsTrigger value="guests" disabled>
            Guests (Coming Soon)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="occupancy" className="pt-4">
          <OccupancyReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}