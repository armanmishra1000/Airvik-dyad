import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { OccupancyReport } from "./components/occupancy-report";
import { RevenueReport } from "./components/revenue-report";

/**
 * Render the Reports page containing a header and tabbed views for available reports.
 *
 * @returns The page's JSX element containing the title, subtitle, and a Tabs control with
 * occupancy and revenue report content (the guests tab is shown as disabled).
 */
export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-semibold tracking-tight">Reports</h2>
        <p className="text-sm text-muted-foreground uppercase tracking-wide">
          Generate and view reports for your property.
        </p>
      </div>
      <Tabs defaultValue="occupancy" className="w-full">
        <TabsList className="flex w-full flex-wrap gap-2 rounded-2xl border border-border/40 bg-card/80 p-1 shadow-sm">
          <TabsTrigger
            value="occupancy"
            className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            Occupancy Report
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="guests"
            disabled
            className="rounded-xl px-4 py-2 text-sm font-medium"
          >
            Guests (Coming Soon)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="occupancy" className="pt-6">
          <OccupancyReport />
        </TabsContent>
        <TabsContent value="revenue" className="pt-6">
          <RevenueReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}