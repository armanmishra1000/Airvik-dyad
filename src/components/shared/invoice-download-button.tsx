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
    invoiceType?: "invoice" | "donation";
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
    invoiceType = "donation",
    variant = "outline",
    size = "default",
    className = "",
}: InvoiceDownloadButtonProps) {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleDownload = async () => {
        if (reservations.length === 0) {
            toast.error("No reservation data available for generation.");
            return;
        }

        setIsGenerating(true);

        try {
            if (invoiceType === "invoice") {
                const { generateInvoice } = await import("@/lib/invoice/generate-invoice");
                await generateInvoice({
                    reservations,
                    guest,
                    property,
                    rooms,
                    roomTypes,
                });
                toast.success("Invoice downloaded successfully!");
            } else {
                const { generateDonationReceipt } = await import("@/lib/invoice/generate-donation-receipt");
                await generateDonationReceipt({
                    reservations,
                    guest,
                    property,
                    rooms,
                    roomTypes,
                });
                toast.success("Donation Receipt downloaded successfully!");
            }
        } catch (error) {
            console.error("Failed to generate document:", error);
            toast.error("Failed to generate document. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const buttonLabel = invoiceType === "invoice" ? "Invoice" : "Donation";

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
                    {buttonLabel}
                </>
            )}
        </Button>
    );
}
