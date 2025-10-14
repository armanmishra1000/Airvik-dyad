"use client";

import * as React from "react";
import { useDataContext } from "@/context/data-context";
import { useAuthContext } from "@/context/auth-context";
import { columns } from "./components/columns";
import { RatePlansDataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import { AssignRatePlanDialog } from "./components/assign-rate-plan-dialog";
import { SeasonOverrideDialog } from "./components/season-override-dialog";
import { toast } from "sonner";
import type { RatePlan, RatePlanSeason } from "@/data/types";

export default function RatesPage() {
  const { ratePlans } = useDataContext();
  const { hasPermission } = useAuthContext();
  const [selectedRatePlan, setSelectedRatePlan] = React.useState<RatePlan | null>(null);
  const [selectedSeasonOverride, setSelectedSeasonOverride] = React.useState<{
    ratePlan: RatePlan;
    season?: RatePlanSeason;
  } | null>(null);

  const handleAssignToRooms = (ratePlan?: RatePlan) => {
    if (ratePlans.length === 0) {
      toast.error("Please create a rate plan first");
      return;
    }
    // Use provided rate plan or default to first one
    setSelectedRatePlan(ratePlan || ratePlans[0]);
  };

  const handleAddOverride = (ratePlan?: RatePlan, season?: RatePlanSeason) => {
    if (ratePlans.length === 0) {
      toast.error("Please create a rate plan first");
      return;
    }
    setSelectedSeasonOverride({
      ratePlan: ratePlan || ratePlans[0],
      season,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Plans</h1>
          <p className="text-muted-foreground">
            Manage pricing plans and seasonal overrides
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission("update:rate_plan") && (
            <>
              <Button variant="outline" onClick={() => handleAssignToRooms()}>
                Assign to Rooms
              </Button>
              <Button variant="outline" onClick={() => handleAddOverride()}>
                Add Override
              </Button>
            </>
          )}
        </div>
      </div>
      <RatePlansDataTable 
        columns={columns} 
        data={ratePlans}
        onOpenAssignDialog={handleAssignToRooms}
        onOpenOverrideDialog={handleAddOverride}
      />

      {/* Assignment Dialog (Epic B) */}
      {selectedRatePlan && (
        <AssignRatePlanDialog
          ratePlan={selectedRatePlan}
          open={!!selectedRatePlan}
          onOpenChange={(open) => !open && setSelectedRatePlan(null)}
        />
      )}

      {/* Seasonal Override Dialog (Epic C) */}
      {selectedSeasonOverride && (
        <SeasonOverrideDialog
          ratePlan={selectedSeasonOverride.ratePlan}
          season={selectedSeasonOverride.season}
          open={!!selectedSeasonOverride}
          onOpenChange={(open) => !open && setSelectedSeasonOverride(null)}
        />
      )}
    </div>
  );
}
