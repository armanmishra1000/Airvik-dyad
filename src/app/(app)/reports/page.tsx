import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, DollarSign, Users, BedDouble } from "lucide-react";

const reportTypes = [
  {
    title: "Occupancy Report",
    description: "Analyze room occupancy rates over various periods.",
    icon: BedDouble,
  },
  {
    title: "Revenue Report",
    description: "Track revenue from rooms, services, and other charges.",
    icon: DollarSign,
  },
  {
    title: "Guest Demographics",
    description: "Understand your guest origins and booking patterns.",
    icon: Users,
  },
  {
    title: "Housekeeping Performance",
    description: "Monitor room cleaning times and staff assignments.",
    icon: BarChart3,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate and view reports for your property.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <report.icon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled>
                Generate Report (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}