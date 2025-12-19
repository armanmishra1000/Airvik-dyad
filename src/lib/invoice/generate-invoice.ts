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
    fillColor?: number[];
    textColor?: number[];
    fontSize?: number;
    fontStyle?: string;
  };
  bodyStyles?: {
    fontSize?: number;
  };
  columnStyles?: Record<number, { halign?: "left" | "center" | "right"; cellWidth?: number | "auto" }>;
  margin?: { left?: number; right?: number };
  tableWidth?: "auto" | "wrap" | number;
}

/**
 * Invoice data structure for generating PDF
 */
export interface InvoiceData {
  reservations: Reservation[];
  guest: Guest | null | undefined;
  property: Property;
  rooms: Room[];
  roomTypes: RoomType[];
}

/**
 * Room charge summary for invoice line items
 */
interface RoomChargeSummary {
  roomTypeName: string;
  quantity: number;
  nights: number;
  ratePerNight: number;
  totalAmount: number;
}

/**
 * Format currency with Rs prefix (avoiding special character issues)
 */
function formatCurrency(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Generate unique invoice number based on booking ID and date
 */
function generateInvoiceNumber(bookingId: string, bookingDate: string): string {
  const year = new Date(bookingDate).getFullYear();
  const shortId = bookingId.substring(0, 8).toUpperCase();
  return `INV-${year}-${shortId}`;
}

/**
 * Calculate room charge summaries grouped by room type
 */
function calculateRoomChargeSummaries(
  reservations: Reservation[],
  rooms: Room[],
  roomTypes: RoomType[]
): RoomChargeSummary[] {
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const roomTypeMap = new Map(roomTypes.map((rt) => [rt.id, rt]));

  // Group reservations by room type
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
      // Calculate rate per night
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
 * Calculate tax totals from reservations
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

  // Return single rate if all reservations have same rate, otherwise null
  const taxRate = taxRates.size === 1 ? Array.from(taxRates)[0] : null;

  return { taxAmount: totalTax, taxRate };
}

/**
 * Generate and download invoice PDF
 */
export function generateInvoice(data: InvoiceData): void {
  const { reservations, guest, property, rooms, roomTypes } = data;

  if (reservations.length === 0) {
    console.error("No reservations provided for invoice generation");
    return;
  }

  // Get primary reservation for common details
  const primaryReservation = reservations[0];
  const bookingId = primaryReservation.bookingId;
  const checkInDate = primaryReservation.checkInDate;
  const checkOutDate = primaryReservation.checkOutDate;
  const bookingDate = primaryReservation.bookingDate;

  // Calculate totals
  const roomChargeSummaries = calculateRoomChargeSummaries(reservations, rooms, roomTypes);
  const subtotal = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const { taxAmount, taxRate } = calculateTaxTotals(reservations);
  const grandTotal = subtotal + taxAmount;

  // Calculate nights
  const nights = differenceInDays(parseISO(checkOutDate), parseISO(checkInDate));

  // Generate invoice number
  const invoiceNumber = generateInvoiceNumber(bookingId, bookingDate);
  const invoiceDate = format(new Date(), "dd MMM yyyy");

  // Create PDF document (A4 size in mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let yPos = margin;

  // ========== HEADER SECTION ==========
  // Hotel Name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SAHAJANAND WELLNESS", margin, yPos);
  yPos += 8;

  // Hotel Address
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Street No.12, Shisham Jhadi, Muni Ki Reti", margin, yPos);
  yPos += 5;
  doc.text("Near Ganga Kinare, Rishikesh, U.K. Pin Code: 249201", margin, yPos);
  yPos += 5;

  // Contact info
  if (property.phone) {
    doc.text(`Phone: ${property.phone}`, margin, yPos);
    yPos += 5;
  }
  if (property.email) {
    doc.text(`Email: ${property.email}`, margin, yPos);
    yPos += 5;
  }

  yPos += 5;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ========== INVOICE TITLE & NUMBER ==========
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin, yPos);

  // Invoice details on right side
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${invoiceNumber}`, pageWidth - margin, yPos - 5, { align: "right" });
  doc.text(`Date: ${invoiceDate}`, pageWidth - margin, yPos, { align: "right" });

  yPos += 12;

  // ========== BILL TO SECTION ==========
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", margin, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Guest name
  const guestName = guest
    ? [guest.firstName, guest.lastName].filter(Boolean).join(" ") || "Guest"
    : "Guest";
  doc.text(guestName, margin, yPos);
  yPos += 5;

  // Guest email
  if (guest?.email) {
    doc.text(guest.email, margin, yPos);
    yPos += 5;
  }

  // Guest phone
  if (guest?.phone) {
    doc.text(`Phone: ${guest.phone}`, margin, yPos);
    yPos += 5;
  }

  // Guest address
  if (guest?.address) {
    doc.text(guest.address, margin, yPos);
    yPos += 5;
  }

  // City, country, pincode
  const locationParts = [guest?.city, guest?.country, guest?.pincode].filter(Boolean);
  if (locationParts.length > 0) {
    doc.text(locationParts.join(", "), margin, yPos);
    yPos += 5;
  }

  yPos += 8;

  // ========== RESERVATION DETAILS ==========
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RESERVATION DETAILS", margin, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Booking ID: ${bookingId.substring(0, 8).toUpperCase()}`, margin, yPos);
  yPos += 5;

  doc.text(`Check-in: ${format(parseISO(checkInDate), "EEE, dd MMM yyyy")}`, margin, yPos);
  yPos += 5;

  doc.text(`Check-out: ${format(parseISO(checkOutDate), "EEE, dd MMM yyyy")}`, margin, yPos);
  yPos += 5;

  doc.text(`Duration: ${nights} night${nights === 1 ? "" : "s"}`, margin, yPos);
  yPos += 5;

  // Guest count
  const totalGuests = reservations.reduce((sum, r) => sum + (r.numberOfGuests || 0), 0);
  const totalAdults = reservations.reduce((sum, r) => sum + (r.adultCount || 0), 0);
  const totalChildren = reservations.reduce((sum, r) => sum + (r.childCount || 0), 0);

  let guestCountText = `Guests: ${totalGuests}`;
  if (totalAdults > 0 || totalChildren > 0) {
    guestCountText += ` (${totalAdults} adult${totalAdults === 1 ? "" : "s"}`;
    if (totalChildren > 0) {
      guestCountText += `, ${totalChildren} ${totalChildren === 1 ? "child" : "children"}`;
    }
    guestCountText += ")";
  }
  doc.text(guestCountText, margin, yPos);
  yPos += 10;

  // ========== CHARGES TABLE ==========
  const tableHead = [["Description", "Qty", "Nights", "Rate/Night", "Amount"]];

  const tableBody = roomChargeSummaries.map((summary) => [
    summary.roomTypeName,
    summary.quantity.toString(),
    summary.nights.toString(),
    formatCurrency(summary.ratePerNight / summary.quantity), // Rate per room per night
    formatCurrency(summary.totalAmount),
  ]);

  doc.autoTable({
    startY: yPos,
    head: tableHead,
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [60, 60, 60],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "right", cellWidth: 35 },
      4: { halign: "right", cellWidth: 35 },
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ========== TOTALS SECTION ==========
  const totalsX = pageWidth - margin - 70;
  const valuesX = pageWidth - margin;

  // Subtotal
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", totalsX, yPos);
  doc.text(formatCurrency(subtotal), valuesX, yPos, { align: "right" });
  yPos += 6;

  // Taxes (if applicable)
  if (taxAmount > 0) {
    const taxLabel = taxRate
      ? `Taxes & Fees (${(taxRate * 100).toFixed(taxRate * 100 % 1 === 0 ? 0 : 2)}%):`
      : "Taxes & Fees:";
    doc.text(taxLabel, totalsX, yPos);
    doc.text(formatCurrency(taxAmount), valuesX, yPos, { align: "right" });
    yPos += 6;
  }

  // Line before grand total
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(totalsX, yPos, valuesX, yPos);
  yPos += 5;

  // Grand Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total:", totalsX, yPos);
  doc.text(formatCurrency(grandTotal), valuesX, yPos, { align: "right" });
  yPos += 15;

  // ========== FOOTER ==========
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for choosing Sahajanand Wellness!", pageWidth / 2, yPos, { align: "center" });
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text("We look forward to welcoming you.", pageWidth / 2, yPos, { align: "center" });

  // ========== SAVE PDF ==========
  const fileName = `Invoice-${invoiceNumber}.pdf`;
  doc.save(fileName);
}
