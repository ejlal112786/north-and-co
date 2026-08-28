import { AdminRole } from "@prisma/client";

export type Permission =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "returns"
  | "customers"
  | "coupons"
  | "reviews"
  | "content"
  | "shipping"
  | "analytics"
  | "settings"
  | "staff"
  | "emails";

const ALL: Permission[] = [
  "dashboard",
  "products",
  "inventory",
  "orders",
  "returns",
  "customers",
  "coupons",
  "reviews",
  "content",
  "shipping",
  "analytics",
  "settings",
  "staff",
  "emails",
];

const MAP: Record<AdminRole, Permission[]> = {
  OWNER: ALL,
  ADMINISTRATOR: ALL,
  MANAGER: ALL.filter((p) => p !== "staff" && p !== "settings"),
  INVENTORY_MANAGER: ["dashboard", "products", "inventory"],
  ORDER_MANAGER: ["dashboard", "orders", "returns", "customers"],
  SUPPORT: ["dashboard", "orders", "returns", "customers", "reviews"],
  MARKETING: ["dashboard", "coupons", "content", "analytics", "reviews"],
};

export function can(role: AdminRole, perm: Permission): boolean {
  return MAP[role]?.includes(perm) ?? false;
}

export function permissionsFor(role: AdminRole): Permission[] {
  return MAP[role] ?? [];
}
