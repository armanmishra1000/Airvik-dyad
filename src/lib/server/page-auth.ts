import "server-only";
import { redirect } from "next/navigation";
import type { Permission } from "@/data/types";
import { getServerSupabaseClient } from "@/lib/server/supabase";
import { getPermissionsForFeatures, type PermissionFeature } from "@/lib/permissions/map";

type ProfileRecord = {
  id: string;
  roles: { name: string | null; permissions: Permission[] | null } | null;
};

export type ServerProfile = {
  userId: string;
  roleName: string | null;
  permissions: Permission[];
};

const LOGIN_PATH = "/admin/login";
const UNAUTHORIZED_PATH = "/admin";

export async function getServerProfile(): Promise<ServerProfile | null> {
  const supabase = getServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, roles:roles(name, permissions)")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  const typedProfile = profile as ProfileRecord;
  const roleName = typedProfile.roles?.name ?? null;
  const permissions = typedProfile.roles?.permissions ?? [];

  return {
    userId: typedProfile.id,
    roleName,
    permissions,
  };
}

export async function requirePagePermissions(
  ...permissions: Permission[]
): Promise<ServerProfile> {
  const profile = await getServerProfile();

  if (!profile) {
    redirect(LOGIN_PATH);
  }

  if (permissions.length === 0) {
    return profile;
  }

  const allowed = permissions.some((permission) =>
    profile.permissions.includes(permission)
  );

  if (!allowed) {
    redirect(`${UNAUTHORIZED_PATH}?unauthorized=1`);
  }

  return profile;
}

export async function requirePageFeature(
  feature: PermissionFeature | PermissionFeature[]
): Promise<ServerProfile> {
  const permissions = getPermissionsForFeatures(feature);
  if (permissions.length === 0) {
    return requirePagePermissions();
  }
  return requirePagePermissions(...permissions);
}
