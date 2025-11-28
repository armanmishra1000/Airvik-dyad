import type { Permission } from "@/data/types";
import { createServerSupabaseClient } from "@/integrations/supabase/server";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export type AuthorizedProfile = {
  userId: string;
  roleName: string | null;
  permissions: Permission[];
};

const BEARER_PREFIX = "bearer ";

export async function requirePermission(
  request: Request,
  requiredPermission: Permission
): Promise<AuthorizedProfile> {
  const token = extractAccessToken(request.headers.get("authorization"));
  if (!token) {
    throw new HttpError(401, "Missing or invalid Authorization header");
  }

  const supabase = createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    throw new HttpError(401, "Invalid access token");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, roles:roles(name, permissions)")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new HttpError(403, "Profile not found");
  }

  const roleRecord = Array.isArray(profile.roles)
    ? profile.roles[0]
    : profile.roles;
  const roleName: string | null = roleRecord?.name ?? null;
  const permissions: Permission[] = roleRecord?.permissions ?? [];

  if (!hasPermission(roleName, permissions, requiredPermission)) {
    throw new HttpError(403, "Insufficient permissions");
  }

  return {
    userId: profile.id,
    roleName,
    permissions,
  };
}

function extractAccessToken(header: string | null): string | null {
  if (!header) return null;
  const normalized = header.trim();
  if (normalized.length === 0) return null;
  if (normalized.toLowerCase().startsWith(BEARER_PREFIX)) {
    return normalized.slice(BEARER_PREFIX.length).trim();
  }
  return normalized;
}

function hasPermission(
  roleName: string | null,
  permissions: Permission[],
  requiredPermission: Permission
): boolean {
  if (!requiredPermission) return true;
  if (roleName === "Hotel Owner") return true;
  return permissions.includes(requiredPermission);
}
