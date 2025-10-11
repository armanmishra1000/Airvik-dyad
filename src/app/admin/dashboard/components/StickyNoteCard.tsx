"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import { MoreVertical, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { StickyNote } from "@/data/types";
import { useDataContext } from "@/context/data-context";
import { cn } from "@/lib/utils";
import { StickyNoteFormDialog, colorOptions } from "./StickyNoteFormDialog";

interface StickyNoteCardProps {
  note: StickyNote;
}

// Create colorClasses object from shared colorOptions
const colorClasses = Object.fromEntries(
  colorOptions.map(option => [option.value, option.cardClass])
) as Record<typeof colorOptions[number]["value"], string>;

export function StickyNoteCard({ note }: StickyNoteCardProps) {
  const { deleteStickyNote } = useDataContext();
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // No rotation - keep cards straight in horizontal format
  const rotationClass = "";

  const formattedDate = React.useMemo(() => {
    if (!hasMounted) return null;

    try {
      const date = parseISO(note.createdAt);
      return isNaN(date.getTime()) ? "Invalid date" : formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  }, [hasMounted, note.createdAt]);

  const handleDelete = () => {
    deleteStickyNote(note.id);
    toast.success("Note deleted.");
  };

  return (
    <div 
      className={cn(
        "group relative rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md focus-visible:outline-none",
        colorClasses[note.color],
        rotationClass
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-4">
        <time className="text-xs opacity-70" dateTime={note.createdAt}>
          {formattedDate}
        </time>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="icon" 
              className="h-7 w-7 opacity-60 transition-opacity hover:opacity-100 focus:opacity-100 sm:h-8 sm:w-8 rounded-xl" 
              aria-label="Note options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 space-y-1">
            <StickyNoteFormDialog note={note}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4 " />
                <span>Edit</span>
              </DropdownMenuItem>
            </StickyNoteFormDialog>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <h4 className="mb-2 font-serif text-base font-semibold leading-snug sm:text-lg">
          {note.title}
        </h4>
        {note.description && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed opacity-90 sm:text-[15px]">
            {note.description}
          </p>
        )}
      </div>
    </div>
  );
}
