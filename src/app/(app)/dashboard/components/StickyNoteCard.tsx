"use client";

import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import * as React from "react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { StickyNote } from "@/data";
import { useAppContext } from "@/context/app-context";
import { cn } from "@/lib/utils";
import { StickyNoteFormDialog } from "./StickyNoteFormDialog";

interface StickyNoteCardProps {
  note: StickyNote;
}

const colorClasses = {
  yellow: "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/50 dark:border-yellow-800",
  pink: "bg-pink-100 border-pink-200 dark:bg-pink-900/50 dark:border-pink-800",
  blue: "bg-blue-100 border-blue-200 dark:bg-blue-900/50 dark:border-blue-800",
  green: "bg-green-100 border-green-200 dark:bg-green-900/50 dark:border-green-800",
};

const rotations = [
  "transform -rotate-2",
  "transform rotate-1",
  "transform rotate-2",
  "transform -rotate-1",
  "transform rotate-3",
];

export function StickyNoteCard({ note }: StickyNoteCardProps) {
  const { deleteStickyNote } = useAppContext();
  const rotationClass = React.useMemo(() => {
    // Make rotation deterministic based on note ID to prevent hydration mismatch
    const index = note.id.charCodeAt(note.id.length - 1) % rotations.length;
    return rotations[index];
  }, [note.id]);

  const handleDelete = () => {
    deleteStickyNote(note.id);
    toast.success("Note deleted.");
  };

  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-shadow", colorClasses[note.color], rotationClass)}>
      <CardHeader className="flex-row items-center justify-between p-3">
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <StickyNoteFormDialog note={note}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            </StickyNoteFormDialog>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="whitespace-pre-wrap font-serif">{note.content}</p>
      </CardContent>
    </Card>
  );
}