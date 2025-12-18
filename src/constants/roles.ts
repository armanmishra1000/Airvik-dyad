export const ROLE_NAMES = {
  ADMINISTRATION: "Administration",
  HOTEL_OWNER: "Hotel Owner",
  HOTEL_MANAGER: "Hotel Manager",
  RECEPTIONIST: "Receptionist",
  HOUSEKEEPER: "Housekeeper",
  GUEST: "Guest",
} as const;

export const ADMIN_ROLES = [
  ROLE_NAMES.ADMINISTRATION,
  ROLE_NAMES.HOTEL_OWNER,
  ROLE_NAMES.HOTEL_MANAGER,
  ROLE_NAMES.RECEPTIONIST,
  ROLE_NAMES.HOUSEKEEPER,
] as const;

export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];
