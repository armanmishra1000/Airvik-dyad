"use client";

import { Plus } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { StickyNoteCard } from "./StickyNoteCard";
import { StickyNoteFormDialog } from "./StickyNoteFormDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardStickyNotes() {
  const { stickyNotes } = useAppContext();

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