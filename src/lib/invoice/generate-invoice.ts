import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format, parseISO, differenceInDays } from "date-fns";
import type { Guest, Property, Reservation, Room, RoomType } from "@/data/types";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: (string | number)[][];
  theme?: "striped" | "grid" | "plain";
  headStyles?: {
    fillColor?: [number, number, number] | string;
    textColor?: [number, number, number] | string;
    fontSize?: number;
    fontStyle?: string;
    halign?: "left" | "center" | "right";
  };
  bodyStyles?: {
    fontSize?: number;
    textColor?: [number, number, number] | string;
  };
  columnStyles?: Record<number, { halign?: "left" | "center" | "right"; cellWidth?: number | "auto" }>;
  margin?: { left?: number; right?: number };
  tableWidth?: "auto" | "wrap" | number;
  didDrawPage?: (data: { doc: jsPDF; pageNumber: number }) => void;
  styles?: {
    cellPadding?: number;
    fontSize?: number;
    font?: string;
    lineColor?: [number, number, number] | number | string;
    lineWidth?: number;
    fontStyle?: string;
    fillColor?: [number, number, number] | number | string;
    textColor?: [number, number, number] | number | string;
  };
}

export interface InvoiceData {
  reservations: Reservation[];
  guest: Guest | null | undefined;
  property: Property;
  rooms: Room[];
  roomTypes: RoomType[];
}

interface RoomChargeSummary {
  roomTypeName: string;
  quantity: number;
  nights: number;
  ratePerNight: number;
  totalAmount: number;
}

interface ImageResult {
  base64: string;
  width: number;
  height: number;
}

// Logo Configuration
const LOGO_CONFIG = {
  HOTEL_LOGO: {
    height: 25,
    width: "auto",
  } as const,
  COMPANY_LOGO: {
    height: 6,
    width: "auto",
  } as const,
};

// Visual Constants
const COLORS = {
  PRIMARY: "#e56824", // Orange
  TEXT_DARK: "#333333",
  TEXT_LIGHT: "#666666",
  BORDER: "#e0e0e0",
  WHITE: "#ffffff",
};

const LOGO_PATH = "/logo.png"; // Stored in E:\SW\Airvik-dyad\public\logo.png
const APEXTURE_LOGO_PATH = "/apexture-logo.svg"; // Stored in E:\SW\Airvik-dyad\public\apexture-logo.svg

/**
 * Format currency with Rs prefix
 */
function formatCurrency(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Generate unique invoice number
 */
function generateInvoiceNumber(bookingId: string, bookingDate: string): string {
  const year = new Date(bookingDate).getFullYear();
  const shortId = bookingId.substring(0, 8).toUpperCase();
  return `INV-${year}-${shortId}`;
}

/**
 * Calculate room charge summaries
 */
function calculateRoomChargeSummaries(
  reservations: Reservation[],
  rooms: Room[],
  roomTypes: RoomType[]
): RoomChargeSummary[] {
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const roomTypeMap = new Map(roomTypes.map((rt) => [rt.id, rt]));

  const summaryByRoomType = new Map<string, RoomChargeSummary>();

  for (const reservation of reservations) {
    const room = roomMap.get(reservation.roomId);
    if (!room) continue;

    const roomType = roomTypeMap.get(room.roomTypeId);
    if (!roomType) continue;

    const nights = differenceInDays(
      parseISO(reservation.checkOutDate),
      parseISO(reservation.checkInDate)
    );

    const existing = summaryByRoomType.get(roomType.id);
    if (existing) {
      existing.quantity += 1;
      existing.totalAmount += reservation.totalAmount;
    } else {
      const ratePerNight = nights > 0 ? reservation.totalAmount / nights : reservation.totalAmount;

      summaryByRoomType.set(roomType.id, {
        roomTypeName: roomType.name,
        quantity: 1,
        nights,
        ratePerNight,
        totalAmount: reservation.totalAmount,
      });
    }
  }

  return Array.from(summaryByRoomType.values());
}

/**
 * Calculate tax
 */
function calculateTaxTotals(reservations: Reservation[]): { taxAmount: number; taxRate: number | null } {
  let totalTax = 0;
  const taxRates = new Set<number>();

  for (const reservation of reservations) {
    if (reservation.taxEnabledSnapshot && reservation.taxRateSnapshot) {
      const taxAmount = reservation.totalAmount * reservation.taxRateSnapshot;
      totalTax += taxAmount;
      taxRates.add(reservation.taxRateSnapshot);
    }
  }

  const taxRate = taxRates.size === 1 ? Array.from(taxRates)[0] : null;
  return { taxAmount: totalTax, taxRate };
}

/**
 * Helper to load image from URL to Base64 (supporting SVG via Canvas)
 * Returns object with base64, naturalWidth, and naturalHeight
 */
async function loadImage(url: string): Promise<ImageResult | null> {
  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Use natural dimensions
        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;

        canvas.width = naturalWidth;
        canvas.height = naturalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        // Use PNG for robustness
        resolve({
          base64: canvas.toDataURL("image/png"),
          width: naturalWidth,
          height: naturalHeight
        });
      };
      img.onerror = (e) => {
        console.warn(`Failed to load image at ${url}`, e);
        resolve(null); // Resolve null gracefully
      };
      img.src = url;
    });
  } catch (error) {
    console.error("Image load error:", error);
    return null;
  }
}

/**
 * Smart Dimension Helper
 * Calculates width/height based on config (fixed or auto)
 */
function calculateDimensions(
  originalW: number,
  originalH: number,
  targetH: number | "auto",
  targetW: number | "auto"
): { width: number; height: number } {
  // Case 1: Fixed Height & Fixed Width (User specified both)
  if (typeof targetH === "number" && typeof targetW === "number") {
    return { width: targetW, height: targetH };
  }

  // Case 2: Fixed Height & Auto Width (Calculated based on aspect ratio)
  if (typeof targetH === "number" && targetW === "auto") {
    const aspectRatio = originalW / originalH;
    return {
      width: targetH * aspectRatio,
      height: targetH,
    };
  }

  // Case 3: Auto Height & Fixed Width (Calculated based on aspect ratio)
  // Although not explicitly requested, good for completeness
  if (targetH === "auto" && typeof targetW === "number") {
    const aspectRatio = originalH / originalW;
    return {
      width: targetW,
      height: targetW * aspectRatio,
    };
  }

  // Case 4: Both Auto (Fallback to original dimensions or reasonable defaults - unlikely config)
  return { width: originalW, height: originalH };
}

/**
 * Draw a rounded rectangle with specific style
 */
function drawRoundedCard(doc: jsPDF, x: number, y: number, width: number, height: number) {
  doc.setDrawColor(220, 220, 220); // #dcdcdc
  doc.setFillColor(255, 255, 255); // White
  doc.roundedRect(x, y, width, height, 2, 2, "FD"); // Fill and Draw
}

/**
 * Generate and download invoice PDF (Async)
 */
export async function generateInvoice(data: InvoiceData): Promise<void> {
  const { reservations, guest, property, rooms, roomTypes } = data;

  if (reservations.length === 0) {
    console.error("No reservations provided for invoice generation");
    return;
  }

  const primaryReservation = reservations[0];
  const bookingId = primaryReservation.bookingId;
  const checkInDate = primaryReservation.checkInDate;
  const checkOutDate = primaryReservation.checkOutDate;
  const bookingDate = primaryReservation.bookingDate;

  const roomChargeSummaries = calculateRoomChargeSummaries(reservations, rooms, roomTypes);
  const subtotal = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const { taxAmount, taxRate } = calculateTaxTotals(reservations);
  const grandTotal = subtotal + taxAmount;
  const nights = differenceInDays(parseISO(checkOutDate), parseISO(checkInDate));
  const invoiceNumber = generateInvoiceNumber(bookingId, bookingDate);
  const invoiceDate = format(new Date(), "dd MMM yyyy");

  // Load Images Async
  const [logoResult, apextureLogoResult] = await Promise.all([
    loadImage(LOGO_PATH),
    loadImage(APEXTURE_LOGO_PATH),
  ]);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  let yPos = margin;

  // ========== HEADER ==========
  // 1. Logo (Left)
  if (logoResult) {
    const { width, height } = calculateDimensions(
      logoResult.width,
      logoResult.height,
      LOGO_CONFIG.HOTEL_LOGO.height,
      LOGO_CONFIG.HOTEL_LOGO.width
    );

    doc.addImage(logoResult.base64, "PNG", margin, yPos, width, height);
  }

  // 2. Invoice Label & Details (Right)
  doc.setTextColor(COLORS.PRIMARY);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Donation Receipt", pageWidth - margin, yPos + 12, { align: "right" });

  doc.setTextColor(COLORS.TEXT_LIGHT); // Grey
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Invoice No:`, pageWidth - margin - 35, yPos + 22, { align: "right" });
  doc.setTextColor(COLORS.TEXT_DARK); // Black
  doc.setFont("helvetica", "bold");
  doc.text(invoiceNumber, pageWidth - margin, yPos + 22, { align: "right" });

  doc.setTextColor(COLORS.TEXT_LIGHT);
  doc.setFont("helvetica", "normal");
  doc.text(`Date:`, pageWidth - margin - 35, yPos + 28, { align: "right" });
  doc.setTextColor(COLORS.TEXT_DARK);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceDate, pageWidth - margin, yPos + 28, { align: "right" });

  // 3. Hotel Details (Below Logo area)
  // Use a sensible offset if auto calculation makes the logo very small or large
  // A safe fixed offset is often better for layout stability, or we can use the configured logo height.
  // Using fixed offset from Top margin + reasonable gap
  const hotelDetailsY = yPos + (typeof LOGO_CONFIG.HOTEL_LOGO.height === 'number' ? LOGO_CONFIG.HOTEL_LOGO.height : 30) + 5;

  doc.setFontSize(11);
  doc.setTextColor(COLORS.TEXT_DARK);
  doc.setFont("helvetica", "bold");
  doc.text(property.name, margin, hotelDetailsY);

  doc.setFontSize(9);
  doc.setTextColor(COLORS.TEXT_LIGHT);
  doc.setFont("helvetica", "normal");

  const addressLines = doc.splitTextToSize(property.address, 90);
  doc.text(addressLines, margin, hotelDetailsY + 5);

  let currentDetailY = hotelDetailsY + 5 + (addressLines.length * 4);

  if (property.phone) {
    doc.text(`Phone: ${property.phone}`, margin, currentDetailY);
    currentDetailY += 4;
  }
  if (property.email) {
    doc.text(`Email: ${property.email}`, margin, currentDetailY);
  }

  yPos = 100; // Fixed start for cards

  // ========== CARDS: BILL TO & RESERVATION ==========
  const cardGap = 10;
  const cardWidth = (pageWidth - (margin * 2) - cardGap) / 2;
  const cardHeight = 55;

  // -- Bill To Card --
  drawRoundedCard(doc, margin, yPos, cardWidth, cardHeight);

  const billToContentX = margin + 5;
  const billToContentY = yPos + 10;

  doc.setFontSize(9);
  doc.setTextColor(COLORS.PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", billToContentX, billToContentY);

  // Separator Line
  doc.setDrawColor(COLORS.BORDER);
  doc.line(billToContentX, billToContentY + 3, margin + cardWidth - 5, billToContentY + 3);

  const guestName = guest
    ? [guest.firstName, guest.lastName].filter(Boolean).join(" ")
    : "Guest";

  doc.setTextColor(COLORS.TEXT_DARK);
  doc.setFontSize(11);
  doc.text(guestName, billToContentX, billToContentY + 12);

  doc.setFontSize(9);
  doc.setTextColor(COLORS.TEXT_LIGHT);
  doc.setFont("helvetica", "normal");

  let guestDetailY = billToContentY + 18;
  if (guest?.email) {
    doc.text(guest.email, billToContentX, guestDetailY);
    guestDetailY += 5;
  }
  if (guest?.phone) {
    doc.text(guest.phone, billToContentX, guestDetailY);
    guestDetailY += 5;
  }

  // Address Composite: Address, City, Pincode, Country
  const guestAddressParts = [
    guest?.address,
    guest?.city,
    guest?.pincode,
    guest?.country
  ].filter(Boolean);

  if (guestAddressParts.length > 0) {
    const addressText = doc.splitTextToSize(guestAddressParts.join(", "), cardWidth - 10);
    doc.text(addressText, billToContentX, guestDetailY);
  }

  // -- Reservation Details Card --
  const resCardX = margin + cardWidth + cardGap;
  drawRoundedCard(doc, resCardX, yPos, cardWidth, cardHeight);

  const resContentX = resCardX + 5;
  const resContentY = yPos + 10;

  doc.setFontSize(9);
  doc.setTextColor(COLORS.PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.text("RESERVATION DETAILS", resContentX, resContentY);

  doc.setDrawColor(COLORS.BORDER);
  doc.line(resContentX, resContentY + 3, resCardX + cardWidth - 5, resContentY + 3);

  // Details Grid
  doc.setFontSize(9);
  const labelX = resContentX;
  const valueX = resContentX + 25;
  let detailRowY = resContentY + 12;
  const rowSpace = 5;

  // Helper for row
  const drawResRow = (label: string, value: string) => {
    doc.setTextColor(COLORS.TEXT_LIGHT);
    doc.setFont("helvetica", "normal");
    doc.text(label, labelX, detailRowY);

    doc.setTextColor(COLORS.TEXT_DARK);
    doc.setFont("helvetica", "bold"); // Provide contrast
    doc.text(value, valueX, detailRowY);
    detailRowY += rowSpace;
  };

  drawResRow("Booking ID:", bookingId.substring(0, 8).toUpperCase());
  drawResRow("Check-in:", format(parseISO(checkInDate), "EEE, dd MMM yyyy"));
  drawResRow("Check-out:", format(parseISO(checkOutDate), "EEE, dd MMM yyyy"));
  drawResRow("Duration:", `${nights} night${nights === 1 ? "" : "s"}`);

  const totalGuests = reservations.reduce((sum, r) => sum + (r.numberOfGuests || 0), 0);
  const totalAdults = reservations.reduce((sum, r) => sum + (r.adultCount || 0), 0);
  drawResRow("Guests:", `${totalGuests} (${totalAdults} adult${totalAdults === 1 ? "" : "s"})`);

  yPos += cardHeight + 15;

  // ========== TABLE ==========
  const tableHead = [["Description", "Qty", "Nights", "Rate/Night", "Amount"]];
  const tableBody = roomChargeSummaries.map((summary) => [
    summary.roomTypeName,
    summary.quantity.toString(),
    summary.nights.toString(),
    formatCurrency(summary.ratePerNight / summary.quantity),
    formatCurrency(summary.totalAmount),
  ]);

  doc.autoTable({
    startY: yPos,
    head: tableHead,
    body: tableBody,
    theme: "plain", // We'll customize manually
    headStyles: {
      fillColor: [229, 104, 36], // #e56824 in RGB
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 51, 51],
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
    styles: {
      cellPadding: 4,
      lineColor: [224, 224, 224],
      lineWidth: 0.1,
    },
    didDrawPage: (data) => {
      // Optional: Header/Footer recurring on new pages could go here
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ========== TOTALS ==========
  const totalsWidth = 80;
  const totalsX = pageWidth - margin - totalsWidth;

  const drawTotalRow = (label: string, value: string, isGrand: boolean = false) => {
    const rowHeight = isGrand ? 12 : 7;

    if (isGrand) {
      // Background for Grand Total
      doc.setFillColor(255, 240, 230); // Very light orange
      doc.roundedRect(totalsX - 5, yPos - 8, totalsWidth + 5, rowHeight + 4, 1, 1, "F");

      doc.setTextColor(COLORS.PRIMARY);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(COLORS.TEXT_DARK);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
    }

    doc.text(label, totalsX, yPos);
    doc.text(value, pageWidth - margin, yPos, { align: "right" });
    yPos += rowHeight;
  };

  drawTotalRow("Subtotal", formatCurrency(subtotal));

  if (taxAmount > 0) {
    const taxLabel = taxRate
      ? `Taxes (${(taxRate * 100).toFixed(0)}%)`
      : "Taxes";
    drawTotalRow(taxLabel, formatCurrency(taxAmount));
  }

  yPos += 2; // Spacing before grand total
  drawTotalRow("Grand Total", formatCurrency(grandTotal), true);

  // ========== FOOTER SECTION ==========
  // Thank you text centered
  const footerTextY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setTextColor(COLORS.PRIMARY);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for choosing Sahajanand Wellness!", pageWidth / 2, footerTextY, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(COLORS.TEXT_LIGHT);
  doc.text("We look forward to welcoming you.", pageWidth / 2, footerTextY + 5, { align: "center" });

  // Managed By + Logo
  const managedY = footerTextY + 15;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150); // Light grey
  doc.text("MANAGED BY", pageWidth / 2, managedY, { align: "center" });

  if (apextureLogoResult) {
    const { width, height } = calculateDimensions(
      apextureLogoResult.width,
      apextureLogoResult.height,
      LOGO_CONFIG.COMPANY_LOGO.height,
      LOGO_CONFIG.COMPANY_LOGO.width
    );
    // Center the logo below "MANAGED BY"
    doc.addImage(apextureLogoResult.base64, "PNG", (pageWidth - width) / 2, managedY + 2, width, height);
  }

  // Save PDF
  const fileName = `Invoice-${invoiceNumber}.pdf`;
  doc.save(fileName);
}
