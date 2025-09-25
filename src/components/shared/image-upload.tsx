"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");

  const handleSave = () => {
    try {
      // Basic URL validation
      new URL(url);
      onChange(url);
      setOpen(false);
      setUrl("");
    } catch (error) {
      toast.error("Invalid URL", {
        description: "Please enter a valid image URL.",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative w-40 h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
        {value ? (
          <>
            <Image
              src={value}
              alt="Logo preview"
              fill
              className="object-contain rounded-lg p-2"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <Upload className="mx-auto h-8 w-8" />
            <p className="text-xs mt-1">No logo uploaded</p>
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            {value ? "Change Logo" : "Upload Logo"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Logo from URL</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="logo-url">Image URL</Label>
            <Input
              id="logo-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}