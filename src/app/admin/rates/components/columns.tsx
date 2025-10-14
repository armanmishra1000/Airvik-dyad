"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { format, parseISO, isFuture } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { RatePlan, RoomRatePlan, RatePlanSeason, RoomType } from "@/data/types"
import { RatePlanFormDialog } from "./rate-plan-form-dialog"

export const columns: ColumnDef<RatePlan>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price (per night)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "assignedRooms",
    header: "Assigned Rooms",
    cell: ({ row, table }) => {
      const ratePlan = row.original
      const roomRatePlans = table.options.meta?.roomRatePlans as RoomRatePlan[] || []
      const roomTypes = table.options.meta?.roomTypes as RoomType[] || []
      
      const assignments = roomRatePlans.filter(
        (rrp) => rrp.rate_plan_id === ratePlan.id
      )
      
      if (assignments.length === 0) {
        return <Badge variant="outline">Not assigned</Badge>
      }
      
      const primaryAssignment = assignments.find((a) => a.is_primary)
      const primaryRoomType = primaryAssignment
        ? roomTypes.find((rt) => rt.id === primaryAssignment.room_type_id)
        : null
      
      const count = assignments.length
      const text = primaryRoomType
        ? `${primaryRoomType.name} (primary)${count > 1 ? ` +${count - 1}` : ""}`
        : `${count} room${count > 1 ? "s" : ""}`
      
      return <Badge variant="secondary">{text}</Badge>
    },
  },
  {
    id: "nextOverride",
    header: "Next Override",
    cell: ({ row, table }) => {
      const ratePlan = row.original
      const ratePlanSeasons = table.options.meta?.ratePlanSeasons as RatePlanSeason[] || []
      
      const futureSeasons = ratePlanSeasons
        .filter((season) => season.rate_plan_id === ratePlan.id)
        .filter((season) => {
          try {
            return isFuture(parseISO(season.start_date))
          } catch {
            return false
          }
        })
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      
      if (futureSeasons.length === 0) {
        return <Badge variant="outline">No overrides</Badge>
      }
      
      const nextSeason = futureSeasons[0]
      try {
        const startDate = format(parseISO(nextSeason.start_date), "MMM d")
        const endDate = format(parseISO(nextSeason.end_date), "MMM d")
        return <Badge variant="secondary">{`${startDate} - ${endDate}`}</Badge>
      } catch {
        return <Badge variant="outline">Invalid date</Badge>
      }
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const ratePlan = row.original
      const hasPermission = table.options.meta?.hasPermission;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {hasPermission?.("update:rate_plan") && (
                <RatePlanFormDialog ratePlan={ratePlan}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                </RatePlanFormDialog>
            )}
            {hasPermission?.("delete:rate_plan") && (
                <DropdownMenuItem
                    className="text-destructive"
                    onSelect={() => table.options.meta?.openDeleteDialog?.(ratePlan)}
                >
                    Delete
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
