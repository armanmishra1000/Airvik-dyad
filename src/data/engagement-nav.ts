import type { PermissionFeature } from "@/lib/permissions/map";

export type EngagementSectionKey = "posts" | "events" | "reviews";

export interface EngagementNavItem {
  label: string;
  href: string;
  feature: PermissionFeature;
}

export interface EngagementSectionConfig {
  title: string;
  description?: string;
  items: readonly EngagementNavItem[];
}

export const ENGAGEMENT_SECTIONS: Record<EngagementSectionKey, EngagementSectionConfig> = {
  posts: {
    title: "Blog Posts",
    description: "Publish updates and organize categories.",
    items: [
      { label: "All Posts", href: "/admin/posts", feature: "posts" },
      { label: "Add Post", href: "/admin/posts/create", feature: "postsCreate" },
      { label: "Categories", href: "/admin/posts/categories", feature: "postsUpdate" },
    ],
  },
  events: {
    title: "Event Promotions",
    description: "Manage banners and featured events.",
    items: [
      { label: "All Promotions", href: "/admin/events", feature: "eventBanner" },
      { label: "Add Promotion", href: "/admin/events/create", feature: "eventBanner" },
    ],
  },
  reviews: {
    title: "Guest Reviews",
    description: "Highlight guest stories on the site.",
    items: [
      { label: "All Reviews", href: "/admin/reviews", feature: "reviews" },
      { label: "Add Review", href: "/admin/reviews/create", feature: "reviewsCreate" },
    ],
  },
};

export function getEngagementSection(key: EngagementSectionKey): EngagementSectionConfig {
  return ENGAGEMENT_SECTIONS[key];
}
