import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format, parseISO, differenceInDays } from "date-fns";
import type { Guest, Property, Reservation, Room, RoomType } from "@/data/types";
import { isReservationRemovedDuringEdit } from "@/lib/reservations/filters";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: { finalY: number };
    putTotalPages(pageExpression: string): jsPDF;
  }
}

/**
 * Internal jsPDF state for type safety without 'any'
 */
interface jsPDFInternal {
  getNumberOfPages: () => number;
  getCurrentPageInfo: () => { pageNumber: number };
  getFontSize: () => number;
  getTextColor: () => string;
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
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
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
  roomNumbers: string[];
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

// Layout Constants
const MARGIN = 20;
const FOOTER_HEIGHT = 20; // Reserved height for the footer at page bottom

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

    const nights = Math.max(
      differenceInDays(
        parseISO(reservation.checkOutDate),
        parseISO(reservation.checkInDate)
      ),
      1
    );

    const roomNumber = room.roomNumber;

    const existing = summaryByRoomType.get(roomType.id);
    if (existing) {
      existing.quantity += 1;
      existing.totalAmount += reservation.totalAmount;
      existing.nights = Math.max(existing.nights, nights);
      if (roomNumber && !existing.roomNumbers.includes(roomNumber)) {
        existing.roomNumbers.push(roomNumber);
      }
    } else {
      const ratePerNight = reservation.totalAmount / nights;

      summaryByRoomType.set(roomType.id, {
        roomTypeName: roomType.name,
        roomNumbers: roomNumber ? [roomNumber] : [],
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
 * Extract additional charges from folio
 */
function calculateAdditionalCharges(reservations: Reservation[]): { description: string; amount: number }[] {
  return reservations.flatMap((r) =>
    (r.folio || [])
      .filter((item) => item.amount > 0)
      .map((item) => ({
        description: item.description,
        amount: item.amount,
      }))
  );
}

/**
 * Extract payment records from folio
 */
function calculatePayments(reservations: Reservation[]): { description: string; amount: number; date: string; method: string }[] {
  return reservations.flatMap((r) =>
    (r.folio || [])
      .filter((item) => item.amount < 0)
      .map((item) => ({
        description: item.description,
        amount: Math.abs(item.amount),
        date: item.timestamp ? format(parseISO(item.timestamp), "dd MMM yyyy") : "-",
        method: item.paymentMethod || "-",
      }))
  );
}

/**
 * Calculate tax
 */
function calculateTaxTotals(reservations: Reservation[], property: Property): { taxAmount: number; taxRate: number | null } {
  let totalTax = 0;
  const taxRates = new Set<number>();

  for (const reservation of reservations) {
    // Determine tax config: snapshot favored, property as fallback
    let isTaxEnabled = false;
    let taxRateValue = 0;

    if (typeof reservation.taxEnabledSnapshot === "boolean") {
      isTaxEnabled = reservation.taxEnabledSnapshot;
      taxRateValue = isTaxEnabled ? reservation.taxRateSnapshot ?? 0 : 0;
    } else {
      isTaxEnabled = !!property.tax_enabled;
      taxRateValue = isTaxEnabled ? property.tax_percentage ?? 0 : 0;
    }

    const taxAmount = reservation.totalAmount * taxRateValue;
    totalTax += taxAmount;

    if (isTaxEnabled && taxRateValue > 0) {
      taxRates.add(taxRateValue);
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
 * Draw footer on every page
 */
function drawFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Use a type-safe cast for internal methods not in base types
  const internal = (doc as unknown as { internal: jsPDFInternal }).internal;
  const currentPage = internal.getCurrentPageInfo().pageNumber;

  // Save state
  const oldFontSize = internal.getFontSize();
  const oldTextColor = internal.getTextColor();

  // Draw Footer Content
  const footerTextY = pageHeight - FOOTER_HEIGHT + 5;

  doc.setFontSize(10);
  doc.setTextColor(COLORS.PRIMARY);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for choosing Sahajanand Wellness!", pageWidth / 2, footerTextY, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(COLORS.TEXT_LIGHT);
  doc.text("We look forward to welcoming you.", pageWidth / 2, footerTextY + 5, { align: "center" });

  // Page Numbers
  doc.setFontSize(8);
  doc.text(`Page ${currentPage} of {total_pages_count_string}`, pageWidth - MARGIN, footerTextY + 5, { align: "right" });

  // Restore state
  doc.setFontSize(oldFontSize);
  // jsPDF doesn't have a simple getTextColor object, we assume standard for now or just set back to dark
  doc.setTextColor(COLORS.TEXT_DARK);
}

/**
 * Ensure enough space remains on page for a section
 */
function ensureSpace(doc: jsPDF, currentY: number, requiredHeight: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const threshold = pageHeight - FOOTER_HEIGHT - 10; // Extra buffer

  if (currentY + requiredHeight > threshold) {
    doc.addPage();
    return MARGIN;
  }
  return currentY;
}

/**
 * Generate and download invoice PDF (Async)
 */
export async function generateInvoice(data: InvoiceData): Promise<void> {
  const { reservations: allReservations, guest, property, rooms, roomTypes } = data;

  // Filter out removed reservations
  const reservations = allReservations.filter(r => !isReservationRemovedDuringEdit(r));

  if (reservations.length === 0) {
    console.error("No active reservations provided for invoice generation");
    return;
  }

  const primaryReservation = reservations[0];
  const bookingId = primaryReservation.bookingId;
  const checkInDate = primaryReservation.checkInDate;
  const checkOutDate = primaryReservation.checkOutDate;
  const bookingDate = primaryReservation.bookingDate;

  const roomChargeSummaries = calculateRoomChargeSummaries(reservations, rooms, roomTypes);
  const additionalCharges = calculateAdditionalCharges(reservations);
  const payments = calculatePayments(reservations);

  const roomSubtotal = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const additionalChargesSubtotal = additionalCharges.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const { taxAmount, taxRate } = calculateTaxTotals(reservations, property);
  const grandTotal = roomSubtotal + additionalChargesSubtotal + taxAmount;
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  const nights = Math.max(differenceInDays(parseISO(checkOutDate), parseISO(checkInDate)), 1);
  const invoiceNumber = generateInvoiceNumber(bookingId, bookingDate);
  const invoiceDate = format(new Date(), "dd MMM yyyy");

  // Load Images Async
  const [logoResult] = await Promise.all([
    loadImage(LOGO_PATH),
    loadImage(APEXTURE_LOGO_PATH),
  ]);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = MARGIN;

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

  doc.text(`Receipt No:`, pageWidth - margin - 35, yPos + 22, { align: "right" });
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
    currentDetailY += 4;
  }

  // --- Trust / NGO Details ---
  currentDetailY += 2; // small gap
  if (property.trust_registration_no) {
    doc.text(`Trust Reg. No: ${property.trust_registration_no}`, margin, currentDetailY);
    currentDetailY += 4;
  }
  if (property.trust_date) {
    doc.text(`Dtd.: ${property.trust_date}`, margin, currentDetailY);
    currentDetailY += 4;
  }
  if (property.pan_no) {
    doc.text(`PAN No: ${property.pan_no}`, margin, currentDetailY);
    currentDetailY += 4;
  }
  if (property.certificate_no) {
    doc.text(`Certificate No: ${property.certificate_no}`, margin, currentDetailY);
    currentDetailY += 4;
  }

  yPos = currentDetailY + 10; // Ensure dynamic spacing based on content height

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
  const totalChildren = reservations.reduce((sum, r) => sum + (r.childCount || 0), 0);
  const guestDetails: string[] = [];
  if (totalAdults > 0) {
    guestDetails.push(`${totalAdults} adult${totalAdults === 1 ? "" : "s"}`);
  }
  if (totalChildren > 0) {
    guestDetails.push(`${totalChildren} ${totalChildren === 1 ? "child" : "children"}`);
  }
  const guestDetailText = guestDetails.length ? ` (${guestDetails.join(", ")})` : "";
  drawResRow("Guests:", `${totalGuests}${guestDetailText}`);

  yPos += cardHeight + 5; // Reduced gap between cards and table (was +15)

  // ========== TABLE ==========
  // Columns: Description, Nights, Amount
  // Removed: Qty, Rate/Night
  const tableHead = [["Description", "Nights", "Amount"]];
  const tableBody = [
    // Room Charges
    ...roomChargeSummaries.map((summary) => [
      summary.roomNumbers.length > 0
        ? `${summary.roomTypeName} (${summary.roomNumbers.join(", ")})`
        : summary.roomTypeName,
      summary.nights.toString(),
      formatCurrency(summary.totalAmount),
    ]),
  ];

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
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
    },
    styles: {
      cellPadding: 4,
      lineColor: [224, 224, 224],
      lineWidth: 0.1,
    },
    margin: { left: margin, right: margin, bottom: FOOTER_HEIGHT + 5 },
    didDrawPage: () => {
      drawFooter(doc);
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ========== ADDITIONAL CHARGES TABLE ==========
  if (additionalCharges.length > 0) {
    yPos = ensureSpace(doc, yPos, 20);

    doc.setTextColor(COLORS.PRIMARY);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Additional Charges", margin, yPos);
    yPos += 5;

    const chargesHead = [["Description", "Amount"]];
    const chargesBody = additionalCharges.map((c) => [
      c.description,
      formatCurrency(c.amount),
    ]);

    doc.autoTable({
      startY: yPos,
      head: chargesHead,
      body: chargesBody,
      theme: "plain",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [51, 51, 51],
        fontSize: 8,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 51, 51],
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { cellWidth: 40, halign: "right" },
      },
      styles: {
        cellPadding: 3,
        lineColor: [224, 224, 224],
        lineWidth: 0.1,
      },
      margin: { left: margin, right: margin, bottom: FOOTER_HEIGHT + 5 },
      didDrawPage: () => {
        drawFooter(doc);
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // ========== PAYMENTS TABLE ==========
  if (payments.length > 0) {
    // Ensure space for table title and at least one row
    yPos = ensureSpace(doc, yPos, 20);

    // Add Payments Section Title
    doc.setTextColor(COLORS.PRIMARY);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Payments Record", margin, yPos);
    yPos += 5;

    const paymentHead = [["Date", "Description", "Method", "Amount"]];
    const paymentBody = payments.map((p) => [
      p.date,
      p.description,
      p.method,
      formatCurrency(p.amount),
    ]);

    doc.autoTable({
      startY: yPos,
      head: paymentHead,
      body: paymentBody,
      theme: "plain",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [51, 51, 51],
        fontSize: 8,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 51, 51],
      },
      columnStyles: {
        0: { cellWidth: 30, halign: "left" },
        1: { cellWidth: "auto", halign: "left" },
        2: { cellWidth: 30, halign: "left" },
        3: { cellWidth: 30, halign: "right" },
      },
      styles: {
        cellPadding: 3,
        lineColor: [224, 224, 224],
        lineWidth: 0.1,
      },
      margin: { left: margin, right: margin, bottom: FOOTER_HEIGHT + 5 },
      didDrawPage: () => {
        drawFooter(doc);
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  } else {
    yPos += 5;
  }

  // ========== TOTALS ==========
  const totalsWidth = 80;
  const totalsX = pageWidth - margin - totalsWidth;

  const drawTotalRow = (label: string, value: string, isGrand: boolean = false) => {
    const rowHeight = isGrand ? 12 : 7;

    // Ensure space for this row
    yPos = ensureSpace(doc, yPos, rowHeight);

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

  // Estimate total height of totals block to keep it together if possible
  const totalSummaryHeight = 35; // Rough estimate for tax + additional + grand + paid + balance
  yPos = ensureSpace(doc, yPos, totalSummaryHeight);

  if (taxAmount > 0) {
    const taxLabel = taxRate
      ? `Taxes (${(taxRate * 100).toFixed(0)}%)`
      : "Taxes";
    drawTotalRow(taxLabel, formatCurrency(taxAmount));
  }

  yPos += 2; // Spacing before grand total
  drawTotalRow("Grand Total", formatCurrency(grandTotal));

  if (totalPaid > 0) {
    drawTotalRow("Total Paid", formatCurrency(totalPaid));
  }

  yPos += 2;
  drawTotalRow("Balance Due (Total)", formatCurrency(balanceDue), true);

  // ========== FOOTER SECTION ==========
  // Finalize page count and replace placeholders
  if (typeof doc.putTotalPages === "function") {
    doc.putTotalPages("{total_pages_count_string}");
  }

  // Save PDF
  const fileName = `Invoice-${invoiceNumber}.pdf`;
  doc.save(fileName);
}
