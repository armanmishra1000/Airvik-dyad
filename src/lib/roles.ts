import type { Role } from "@/data/types";

const levelOf = (role?: Role | null): number => {
  if (!role) return 0;
  return typeof role.hierarchyLevel === "number" ? role.hierarchyLevel : 0;
};

export const canManageRole = (actorRole?: Role | null, targetRole?: Role | null): boolean => {
  if (!actorRole || !targetRole) return false;
  return levelOf(actorRole) > levelOf(targetRole);
};

export const filterManageableRoles = (actorRole: Role | null, roles: Role[]): Role[] =>
  roles.filter((role) => canManageRole(actorRole, role));

export const findRoleById = (roles: Role[], roleId?: string | null): Role | undefined =>
  roles.find((role) => role.id === roleId);
