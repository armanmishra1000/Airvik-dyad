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
    className:
      "border border-secondary/50 bg-secondary/30 hover:bg-secondary/40",
  },
  {
    value: "pink",
    className: "border border-accent/50 bg-accent/30 hover:bg-accent/40",
  },
  {
    value: "blue",
    className: "border border-primary/40 bg-primary/15 hover:bg-primary/20",
  },
  {
    value: "green",
    className: "border border-muted/50 bg-muted/40 hover:bg-muted/50",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Note" : "Add New Note"}
          </DialogTitle>
          <DialogDescription>
            Write your note and choose a color.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title..." {...field} />
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
                      className="min-h-[100px]"
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
                          className={cn(
                            "h-11 w-11 rounded-xl shadow-sm",
                            opt.className
                          )}
                        />
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Add Note"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}