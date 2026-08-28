import { requireAdmin } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";
import type { NextResponse } from "next/server";
import type { AdminUser } from "@prisma/client";

export async function requireAdminApi(perm?: Permission): Promise<
  { user: AdminUser; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  const user = await requireAdmin(perm);
  return { user };
}
