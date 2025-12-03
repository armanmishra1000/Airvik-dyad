import { getServerSupabaseClient } from "@/lib/server/supabase";
import type {
  AdminActivityLogInput,
  AdminActivityLogPayload,
} from "@/data/types";
import type { AuthorizedProfile } from "@/lib/server/auth";

export async function logAdminActivityServer(
  payload: AdminActivityLogPayload
) {
  const supabase = getServerSupabaseClient();
  const { error } = await supabase.rpc("log_admin_activity_rpc", {
    p_actor_user_id: payload.actorUserId,
    p_section: payload.section,
    p_action: payload.action,
    p_actor_role: payload.actorRole ?? null,
    p_actor_name: payload.actorName ?? null,
    p_entity_type: payload.entityType ?? null,
    p_entity_id: payload.entityId ?? null,
    p_entity_label: payload.entityLabel ?? null,
    p_details: payload.details ?? null,
    p_amount_minor: payload.amountMinor ?? null,
    p_metadata: payload.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message ?? "Failed to log admin activity");
  }
}

export async function logAdminActivityFromProfile(
  params: {
    profile: AuthorizedProfile;
    entry: AdminActivityLogInput;
    actorName?: string | null;
  }
) {
  return logAdminActivityServer({
    actorUserId: params.profile.userId,
    actorRole: params.profile.roleName,
    actorName: params.actorName ?? null,
    ...params.entry,
  });
}
