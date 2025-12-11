export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) {
    return [items];
  }

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function normalizeCurrency(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (!value) return 0;
  const stringValue = value.toString().trim();
  const isNegative = /\((.*)\)/.test(stringValue) || stringValue.startsWith("-");
  const normalized = stringValue
    .replace(/[()]/g, "")
    .replace(/[^0-9.,-]/g, "")
    .replace(/,(?=\d{3}\b)/g, "");
  const amount = Number(normalized.replace(/,/g, ""));
  if (!Number.isFinite(amount)) return 0;
  return isNegative ? -Math.abs(amount) : amount;
}

export function safeTrim(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function titleCase(value: string): string {
  if (!value) return value;
  return value
    .split(/\s+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}
