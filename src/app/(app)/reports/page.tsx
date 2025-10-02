import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { OccupancyReport } from "./components/occupancy-report";
import { RevenueReport } from "./components/revenue-report";

/**
 * Render the Reports page UI with a header and tabbed views for available reports.
 *
 * The component displays a "Reports" heading, a subtitle, and a tabbed interface
 * with an Occupancy Report and Revenue Report. A "Guests" tab is shown but disabled.
 *
 * @returns The React element for the reports page containing the header and tabs.
 */
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
          <TabsTrigger value="revenue">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="guests" disabled>
            Guests (Coming Soon)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="occupancy" className="pt-4">
          <OccupancyReport />
        </TabsContent>
        <TabsContent value="revenue" className="pt-4">
          <RevenueReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}