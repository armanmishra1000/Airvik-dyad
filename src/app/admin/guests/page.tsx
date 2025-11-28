"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useDataContext } from "@/context/data-context";
import { columns } from "./components/columns";
import { GuestsDataTable } from "./components/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GuestFormDialog } from "./components/guest-form-dialog";
import type { Guest } from "@/data/types";
import { Button } from "@/components/ui/button";

export default function GuestsPage() {
  const { guests } = useDataContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  const intent = searchParams?.get("intent") ?? null;
  const redirectParam = searchParams?.get("redirect") ?? "/admin/reservations/new";
  const safeRedirect = redirectParam.startsWith("/") ? redirectParam : "/admin/reservations/new";
  const isReservationFlow = intent === "create-for-reservation";

  const handleGuestCreated = (guest: Guest) => {
    router.replace(`${safeRedirect}?guestId=${guest.id}`);
  };

  return (
    <div className="space-y-6">
      {isReservationFlow && (
        <Alert>
          <AlertTitle>Creating a guest for a reservation</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Complete this guest profile and you&apos;ll return to the reservation form with the guest pre-selected.
            </p>
            <GuestFormDialog defaultOpen onGuestCreated={handleGuestCreated}>
              <Button size="sm" variant="outline">
                Open guest form
              </Button>
            </GuestFormDialog>
          </AlertDescription>
        </Alert>
      )}
      <GuestsDataTable columns={columns} data={guests} />
    </div>
  );
}
