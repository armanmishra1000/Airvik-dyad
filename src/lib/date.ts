import { endOfDay, parseISO, startOfDay } from "date-fns";

export type DateRange = {
  start: Date;
  end: Date;
};

export function getTodayRange(reference: Date = new Date()): DateRange {
  return {
    start: startOfDay(reference),
    end: endOfDay(reference),
  };
}

export function isISODateWithinRange(isoDate: string, range: DateRange): boolean {
  const value = parseISO(isoDate);
  return value >= range.start && value <= range.end;
}
