"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      onChange(previewUrl);
    } else {
      toast.error("Invalid file type", {
        description: "Please upload an image file.",
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative w-40 h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 cursor-pointer transition-colors",
          isDragging && "border-primary bg-primary/10"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
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
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground p-2">
            <Upload className="mx-auto h-8 w-8" />
            <p className="text-xs mt-2">
              Drag & drop or click to upload
            </p>
          </div>
        )}
      </div>
    </div>
  );
}