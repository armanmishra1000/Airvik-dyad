"use client";

import * as React from "react";
import { useDataContext } from "@/context/data-context";
import { useAuthContext } from "@/context/auth-context";
import { columns } from "./components/columns";
import { RatePlansDataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function RatesPage() {
  const { ratePlans } = useDataContext();
  const { hasPermission } = useAuthContext();
  const [showAssignDialog, setShowAssignDialog] = React.useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = React.useState(false);

  const handleAssignToRooms = () => {
    setShowAssignDialog(true);
    toast.info("Assignment feature coming in Epic B");
  };

  const handleAddOverride = () => {
    setShowOverrideDialog(true);
    toast.info("Override feature coming in Epic C");
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
              <Button variant="outline" onClick={handleAssignToRooms}>
                Assign to Rooms
              </Button>
              <Button variant="outline" onClick={handleAddOverride}>
                Add Override
              </Button>
            </>
          )}
        </div>
      </div>
      <RatePlansDataTable columns={columns} data={ratePlans} />

      {/* Placeholder dialogs for Epic B & C */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Rate Plan to Rooms</DialogTitle>
            <DialogDescription>
              This feature will be available in Epic B. You&apos;ll be able to map
              rate plans to specific room types and set base prices for each
              assignment.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Seasonal Override</DialogTitle>
            <DialogDescription>
              This feature will be available in Epic C. You&apos;ll be able to create
              seasonal price overrides with date ranges, min/max stay rules, and
              CTA/CTD toggles.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
