"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { StickyNote } from "@/data/types";
import { useDataContext } from "@/context/data-context";
import { cn } from "@/lib/utils";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  color: z.enum(["yellow", "pink", "blue", "green"]),
});

interface StickyNoteFormDialogProps {
  note?: StickyNote;
  children: React.ReactNode;
}

const colorOptions = [
  {
    value: "yellow",
    label: "Yellow",
    normalClass: "bg-secondary/40 border-secondary/50 hover:bg-secondary/50 dark:bg-secondary/30 dark:border-secondary/40",
    selectedClass: "data-[state=on]:bg-secondary/60 data-[state=on]:border-secondary dark:data-[state=on]:bg-secondary/50 dark:data-[state=on]:border-secondary",
  },
  {
    value: "pink",
    label: "Pink",
    normalClass: "bg-accent/40 border-accent/50 hover:bg-accent/50 dark:bg-accent/30 dark:border-accent/40",
    selectedClass: "data-[state=on]:bg-accent/60 data-[state=on]:border-accent dark:data-[state=on]:bg-accent/50 dark:data-[state=on]:border-accent",
  },
  {
    value: "blue",
    label: "Blue",
    normalClass: "bg-primary/20 border-primary/40 hover:bg-primary/30 dark:bg-primary/15 dark:border-primary/30",
    selectedClass: "data-[state=on]:bg-primary/35 data-[state=on]:border-primary dark:data-[state=on]:bg-primary/30 dark:data-[state=on]:border-primary",
  },
  {
    value: "green",
    label: "Green",
    normalClass: "bg-emerald-100 border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-700/50",
    selectedClass: "data-[state=on]:bg-emerald-200 data-[state=on]:border-emerald-500 dark:data-[state=on]:bg-emerald-800/60 dark:data-[state=on]:border-emerald-600",
  },
] as const;

export function StickyNoteFormDialog({
  note,
  children,
}: StickyNoteFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { addStickyNote, updateStickyNote } = useDataContext();
  const isEditing = !!note;

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || "",
      description: note?.description || "",
      color: note?.color || "yellow",
    },
  });

  async function onSubmit(values: z.infer<typeof noteSchema>) {
    try {
      if (isEditing && note) {
        await updateStickyNote(note.id, values);
      } else {
        await addStickyNote(values);
      }
      
      toast.success(
        `Note ${isEditing ? "updated" : "created"} successfully!`
      );
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save note", {
        description: (error as Error).message,
      });
    }
  }

  // Keyboard shortcut: Ctrl/Cmd+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent 
        className="w-[calc(100vw-2rem)] h-auto max-h-[85vh] max-w-[420px] rounded-2xl p-4 sm:w-full sm:max-w-md sm:p-6 overflow-y-auto [&>button]:rounded-xl [&>button]:bg-primary/10 [&>button]:text-primary [&>button]:hover:text-primary"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Note" : "Add New Note"}
          </DialogTitle>
          <DialogDescription>
            Write your note and choose a color. Press Ctrl+Enter to save.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Note title..." 
                        className="h-10 sm:h-11 border border-input focus-visible:border-input"
                        autoFocus
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your note details here..."
                        className="min-h-[100px] sm:min-h-[120px] resize-none border border-input focus-visible:border-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={field.onChange}
                        className="justify-start gap-3"
                      >
                        {colorOptions.map(opt => (
                          <ToggleGroupItem
                            key={opt.value}
                            value={opt.value}
                            aria-label={opt.label}
                            title={opt.label}
                            className={cn(
                              "h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-2 transition-all",
                              "data-[state=on]:border-[3px]",
                              opt.normalClass,
                              opt.selectedClass
                            )}
                          />
                        ))}
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-2 sm:mt-4">
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full h-11 sm:h-12 font-semibold"
                >
                  {isEditing ? "Save Changes" : "Add Note"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
}
