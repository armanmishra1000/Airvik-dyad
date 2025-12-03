"use client";

import { AvailabilityCalendar } from "@/components/shared/availability-calendar";
import { PermissionGate } from "@/components/admin/permission-gate";

export default function CalendarPage() {
  return (
    <PermissionGate feature="calendar">
      <div>
        <AvailabilityCalendar />
      </div>
    </PermissionGate>
  );
}
