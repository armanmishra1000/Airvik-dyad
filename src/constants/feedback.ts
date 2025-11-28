import type { FeedbackStatus, FeedbackType } from "@/data/types";

export const FEEDBACK_TYPE_OPTIONS: Array<{ label: string; value: FeedbackType }> = [
  { label: "Suggestion", value: "suggestion" },
  { label: "Praise", value: "praise" },
  { label: "Complaint", value: "complaint" },
  { label: "Question", value: "question" },
];

export const FEEDBACK_STATUS_OPTIONS: Array<{ label: string; value: FeedbackStatus }> = [
  { label: "New", value: "new" },
  { label: "In Review", value: "in_review" },
  { label: "Resolved", value: "resolved" },
];

export const FEEDBACK_STATUS_BADGE_VARIANT: Record<FeedbackStatus, "default" | "secondary" | "destructive"> = {
  new: "secondary",
  in_review: "default",
  resolved: "default",
};

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: "New",
  in_review: "In Review",
  resolved: "Resolved",
};

export const FEEDBACK_TYPE_LABEL: Record<FeedbackType, string> = {
  suggestion: "Suggestion",
  praise: "Praise",
  complaint: "Complaint",
  question: "Question",
};

export const ROOM_OR_FACILITY_OPTIONS = [
  "Rooms",
  "Dining Hall",
  "Garden",
  "Temple",
  "Meditation Hall",
  "Library",
  "Wellness Center",
  "Other",
] as const;

export type RoomOrFacility = typeof ROOM_OR_FACILITY_OPTIONS[number];

export const MAX_FEEDBACK_LENGTH = 500;
