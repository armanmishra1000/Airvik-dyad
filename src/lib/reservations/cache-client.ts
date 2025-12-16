import { authorizedFetch } from "@/lib/auth/client-session";

export async function revalidateReservationsCache(): Promise<boolean> {
  try {
    const response = await authorizedFetch("/api/admin/reservations/revalidate", {
      method: "POST",
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const body = (await response.json().catch(() => ({}))) as {
      revalidated?: boolean;
    };

    return Boolean(body?.revalidated);
  } catch {
    return false;
  }
}
