import { headers } from "next/headers";
import { prisma } from "./prisma";
import { getClientIp } from "./utils";
import type { AdminUser } from "@prisma/client";
import type { Permission } from "./permissions";

/** Open desk actor — no login. Not a database row (do not use as a FK). */
export const DESK: AdminUser = {
  id: "",
  email: "samuel.w@example.com",
  passwordHash: "",
  name: "Desk",
  role: "OWNER",
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

export async function getAdmin(): Promise<AdminUser> {
  return DESK;
}

export async function requireAdmin(perm?: Permission) {
  void perm;
  return DESK;
}

export async function audit(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  meta?: unknown
) {
  const h = await headers();
  await prisma.auditLog.create({
    data: {
      userId: userId || undefined,
      action,
      entity,
      entityId,
      meta: JSON.stringify(meta ?? {}),
      ip: getClientIp(h),
    },
  });
}
