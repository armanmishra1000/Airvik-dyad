import { EventBannerForm } from "@/components/admin/event-banner/event-banner-form";
import { fetchLatestEventBanner } from "@/lib/server/event-banners";
import { requirePageFeature } from "@/lib/server/page-auth";

export default async function EventBannerPage() {
  await requirePageFeature("eventBanner");

  let banner = null;
  try {
    banner = await fetchLatestEventBanner({ includeInactive: true });
  } catch (error) {
    console.error("Failed to prefetch event banner", error);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Event Banner</h1>
        <p className="text-muted-foreground">
          Control the homepage pop-up by setting an image, title, description, and schedule.
        </p>
      </div>
      <EventBannerForm initialBanner={banner} />
    </div>
  );
}
