"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import type { Testimonial } from "@/data/types";
import { deleteTestimonial, toggleTestimonialPublish } from "@/lib/server/testimonials";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface TestimonialsTableProps {
  testimonials: Testimonial[];
}

export function TestimonialsTable({ testimonials }: TestimonialsTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this testimonial? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteTestimonial(id);
        toast.success("Testimonial deleted");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete testimonial");
      }
    });
  };

  const handleToggle = (id: string, nextValue: boolean) => {
    startTransition(async () => {
      try {
        await toggleTestimonialPublish(id, nextValue);
        toast.success(nextValue ? "Testimonial published" : "Testimonial unpublished");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update testimonial");
      }
    });
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead className="w-[220px]">Reviewer</TableHead>
            <TableHead>Content</TableHead>
            <TableHead className="w-[160px]">Published</TableHead>
            <TableHead className="text-right w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testimonials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No testimonials yet.
              </TableCell>
            </TableRow>
          ) : (
            testimonials.map((testimonial) => (
              <TableRow key={testimonial.id}>
                <TableCell>
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border bg-muted">
                    {testimonial.imageUrl ? (
                      <Image
                        src={testimonial.imageUrl}
                        alt={`${testimonial.reviewerName} avatar`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{testimonial.reviewerName}</span>
                    {testimonial.reviewerTitle && (
                      <span className="text-sm text-muted-foreground">{testimonial.reviewerTitle}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {testimonial.content}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={testimonial.isPublished}
                      onCheckedChange={(value) => handleToggle(testimonial.id, value)}
                      disabled={isPending}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        testimonial.isPublished ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {testimonial.isPublished ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/testimonials/${testimonial.id}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(testimonial.id)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
