import type { DonationFrequency } from "@/data/types";

export type DonationReceipt = {
  donationId: string;
  amountInMinor: number;
  currency: string;
  frequency: DonationFrequency;
  email?: string;
  message?: string;
  paymentId?: string;
  timestamp?: string;
};

const STORAGE_KEY = "donation:receipts";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function storeDonationReceipt(receipt: DonationReceipt) {
  if (!isBrowser()) return;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const map: Record<string, DonationReceipt> = raw ? JSON.parse(raw) : {};
    map[receipt.donationId] = receipt;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn("Unable to store donation receipt", error);
  }
}

export function getDonationReceipt(donationId: string): DonationReceipt | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, DonationReceipt>;
    return map[donationId] ?? null;
  } catch (error) {
    console.warn("Unable to read donation receipt", error);
    return null;
  }
}
