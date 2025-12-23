import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import type { Guest, Property, Reservation, Room, RoomType, FolioItem } from "@/data/types";

// Types
export interface DonationReceiptData {
    reservations: Reservation[];
    guest: Guest | null | undefined;
    property: Property;
    rooms: Room[];
    roomTypes: RoomType[];
}

// Colors and Styles
const COLORS = {
    PRIMARY: "#e56824", // Premium Orange
    TEXT_DARK: "#333333",
    TEXT_LIGHT: "#666666",
    BORDER: "#e0e0e0",
    BG_LIGHT: "#f9f9f9",
};

const MARGIN = 20;

/**
 * Convert number to Indian currency words
 */
function numberToWords(num: number): string {
    if (num === 0) return "Zero";

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const formatGroup = (n: number) => {
        let str = "";
        if (n > 99) {
            str += a[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n > 19) {
            str += b[Math.floor(n / 10)] + " " + a[n % 10];
        } else {
            str += a[n];
        }
        return str.trim();
    };

    let words = "";
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remaining = num;

    if (crore > 0) words += formatGroup(crore) + " Crore ";
    if (lakh > 0) words += formatGroup(lakh) + " Lakh ";
    if (thousand > 0) words += formatGroup(thousand) + " Thousand ";
    if (remaining > 0) words += formatGroup(remaining);

    return "Rupees " + words.trim();
}

/**
 * Format currency to Indian Rupees
 */
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Generate bespoke Donation Receipt PDF
 */
export async function generateDonationReceipt(data: DonationReceiptData): Promise<void> {
    const { reservations, guest, property } = data;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = MARGIN;

    // 1. Header (Centered)
    // Logo placeholder (using property logo if available, else name)
    if (property.logo_url) {
        try {
            const img = new Image();
            img.src = property.logo_url;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            const logoWidth = 30;
            doc.addImage(img, "PNG", (pageWidth - logoWidth) / 2, yPos, logoWidth, logoWidth);
            yPos += logoWidth + 5;
        } catch (e) {
            console.error("Failed to load logo", e);
            yPos += 10;
        }
    }

    doc.setTextColor(COLORS.PRIMARY);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(property.name.toUpperCase(), pageWidth / 2, yPos, { align: "center" });
    yPos += 8;

    doc.setTextColor(COLORS.TEXT_LIGHT);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(property.address, pageWidth - MARGIN * 4);
    addressLines.forEach((line: string) => {
        doc.text(line, pageWidth / 2, yPos, { align: "center" });
        yPos += 4;
    });

    doc.text(`Phone: ${property.phone} | Email: ${property.email}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // 2. Info Boxes (Trust Details and Receipt Details)
    const boxWidth = (pageWidth - MARGIN * 2 - 10) / 2;
    const boxHeight = 25;

    // Left Box: Trust Details
    doc.setDrawColor(COLORS.BORDER);
    doc.roundedRect(MARGIN, yPos, boxWidth, boxHeight, 2, 2, "S");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("TRUST / NGO DETAILS", MARGIN + 5, yPos + 5);
    doc.setFont("helvetica", "normal");
    doc.text(`Reg No: ${property.trust_registration_no || "N/A"}`, MARGIN + 5, yPos + 10);
    doc.text(`PAN: ${property.pan_no || "N/A"}`, MARGIN + 5, yPos + 15);
    doc.text(`80G Reg: ${property.certificate_no || "N/A"}`, MARGIN + 5, yPos + 20);

    // Right Box: Receipt Info
    doc.roundedRect(pageWidth - MARGIN - boxWidth, yPos, boxWidth, boxHeight, 2, 2, "S");
    doc.setFont("helvetica", "bold");
    doc.text("DONATION RECEIPT", pageWidth - MARGIN - boxWidth + 5, yPos + 5);
    doc.setFont("helvetica", "normal");
    const receiptNo = reservations[0]?.bookingId?.slice(-8).toUpperCase() || "N/A";
    doc.text(`Receipt No: DR-${receiptNo}`, pageWidth - MARGIN - boxWidth + 5, yPos + 12);
    doc.text(`Date: ${format(new Date(), "dd-MM-yyyy")}`, pageWidth - MARGIN - boxWidth + 5, yPos + 18);

    yPos += boxHeight + 15;

    // 3. Donor Details Box
    const donorBoxHeight = 40;
    doc.roundedRect(MARGIN, yPos, pageWidth - MARGIN * 2, donorBoxHeight, 2, 2, "S");
    doc.setFont("helvetica", "bold");
    doc.text("DONOR DETAILS", MARGIN + 5, yPos + 5);

    doc.setFont("helvetica", "normal");
    const guestName = guest ? `${guest.firstName} ${guest.lastName}` : "Guest";
    doc.text(`Name: ${guestName}`, MARGIN + 5, yPos + 15);
    doc.text(`Address: ${guest?.address || "N/A"}`, MARGIN + 5, yPos + 20);
    doc.text(`PAN: ${guest?.pincode ? "Available" : "N/A"}`, MARGIN + 5, yPos + 25); // Placeholder for PAN
    doc.text(`Mobile: ${guest?.phone || "N/A"}`, MARGIN + 5, yPos + 30);
    doc.text(`Email: ${guest?.email || "N/A"}`, MARGIN + 5, yPos + 35);

    yPos += donorBoxHeight + 15;

    // 4. Amount Section
    const totalPaid = reservations.reduce((sum, res) => {
        const receipts = res.folio.filter(item => item.amount < 0);
        return sum + Math.abs(receipts.reduce((s, r) => s + r.amount, 0));
    }, 0);

    const amountBoxHeight = 20;
    doc.setFillColor(COLORS.BG_LIGHT);
    doc.roundedRect(MARGIN, yPos, pageWidth - MARGIN * 2, amountBoxHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.BORDER);
    doc.roundedRect(MARGIN, yPos, pageWidth - MARGIN * 2, amountBoxHeight, 2, 2, "S");

    doc.setFont("helvetica", "bold");
    doc.text("Donation Amount in words:", MARGIN + 5, yPos + 7);
    doc.setFont("helvetica", "normal");
    doc.text(numberToWords(Math.floor(totalPaid)), MARGIN + 5, yPos + 13);

    // Big Amount Box on right
    const figureBoxWidth = 50;
    doc.setFillColor(COLORS.PRIMARY);
    doc.roundedRect(pageWidth - MARGIN - figureBoxWidth, yPos, figureBoxWidth, amountBoxHeight, 2, 2, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(totalPaid), pageWidth - MARGIN - figureBoxWidth / 2, yPos + 12, { align: "center" });

    yPos += amountBoxHeight + 15;

    // 5. Payment Details
    doc.setTextColor(COLORS.TEXT_DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT DETAILS", MARGIN, yPos);
    yPos += 5;

    const payments = reservations.flatMap(r => r.folio.filter(f => f.amount < 0));
    const paymentMethod = payments[0]?.paymentMethod || reservations[0]?.paymentMethod || "N/A";
    const refNo = payments[0]?.externalReference || "N/A";

    doc.setFont("helvetica", "normal");
    doc.text(`Mode of Payment: ${paymentMethod}`, MARGIN, yPos);
    yPos += 5;
    doc.text(`Transaction Ref: ${refNo}`, MARGIN, yPos);

    yPos += 20;

    // 6. Signatures
    const sigWidth = 60;
    doc.setDrawColor(COLORS.TEXT_LIGHT);
    doc.line(MARGIN, yPos, MARGIN + sigWidth, yPos);
    doc.text("Donor's Signature", MARGIN + sigWidth / 2, yPos + 5, { align: "center" });

    doc.line(pageWidth - MARGIN - sigWidth, yPos, pageWidth - MARGIN, yPos);
    doc.text("Authorized Representative", pageWidth - MARGIN - sigWidth / 2, yPos + 5, { align: "center" });

    // 7. Statutory Footer
    const footerY = doc.internal.pageSize.getHeight() - 25;
    doc.setFontSize(7);
    doc.setTextColor(COLORS.TEXT_LIGHT);
    const footerLines = [
        `Registered Office: ${property.address}`,
        `Trust Reg No: ${property.trust_registration_no || "N/A"} | PAN: ${property.pan_no || "N/A"}`,
        `Donations are exempt under Section 80G of the Income Tax Act. Unique Regn. No. (80G): ${property.certificate_no || "N/A"}`,
    ];
    footerLines.forEach((line, i) => {
        doc.text(line, pageWidth / 2, footerY + i * 4, { align: "center" });
    });

    // Save/Download
    const filename = `Donation_Receipt_${receiptNo}.pdf`;
    doc.save(filename);
}
