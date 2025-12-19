"use client";

import * as React from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Guest, Property, Reservation, Room, RoomType } from "@/data/types";

interface InvoiceDownloadButtonProps {
    reservations: Reservation[];
    guest: Guest | null | undefined;
    property: Property;
    rooms: Room[];
    roomTypes: RoomType[];
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

/**
 * Button component that generates and downloads an invoice PDF
 * Uses dynamic import to load jsPDF only on client-side
 */
export function InvoiceDownloadButton({
    reservations,
    guest,
    property,
    rooms,
    roomTypes,
    variant = "outline",
    size = "default",
    className = "",
}: InvoiceDownloadButtonProps) {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleDownload = async () => {
        if (reservations.length === 0) {
            toast.error("No reservation data available for invoice generation.");
            return;
        }

        setIsGenerating(true);

        try {
            // Dynamic import to ensure client-side only loading
            const { generateInvoice } = await import("@/lib/invoice/generate-invoice");

            generateInvoice({
                reservations,
                guest,
                property,
                rooms,
                roomTypes,
            });

            toast.success("Invoice downloaded successfully!");
        } catch (error) {
            console.error("Failed to generate invoice:", error);
            toast.error("Failed to generate invoice. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={() => void handleDownload()}
            disabled={isGenerating || reservations.length === 0}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <FileText className="mr-2 h-4 w-4" />
                    Invoice Download
                </>
            )}
        </Button>
    );
}
