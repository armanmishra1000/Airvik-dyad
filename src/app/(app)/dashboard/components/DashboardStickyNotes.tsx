"use client";

import { Plus } from "lucide-react";
import { useDataContext } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import { StickyNoteCard } from "./StickyNoteCard";
import { StickyNoteFormDialog } from "./StickyNoteFormDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Render a "Sticky Notes" card with an add-note control and the current list of sticky notes.
 *
 * The card header includes a title and a button that opens the note creation dialog. The card
 * content displays a responsive grid of StickyNoteCard components when notes exist, or a
 * centered empty-state message when there are no notes.
 *
 * @returns A React element for the sticky notes card: a responsive grid of notes when `stickyNotes` contains items, otherwise a centered prompt to add a note.
 */
export function DashboardStickyNotes() {
  const { stickyNotes } = useDataContext();

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sticky Notes</CardTitle>
            <StickyNoteFormDialog>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                </Button>
            </StickyNoteFormDialog>
        </CardHeader>
        <CardContent>
            {stickyNotes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {stickyNotes.map((note) => (
                        <StickyNoteCard key={note.id} note={note} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>No sticky notes yet. Add one to get started!</p>
                </div>
            )}
        </CardContent>
    </Card>
  );
}