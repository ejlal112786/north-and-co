import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/guard";
import { audit } from "@/lib/auth";
import { json, error } from "@/lib/http";
import { CouponType } from "@prisma/client";
import { z } from "zod";

export async function POST(req: Request) {
  const auth = await requireAdminApi("coupons");
  if (auth.error) return auth.error;
  try {
    const body = z
      .object({
        code: z.string().min(2),
        type: z.enum(CouponType),
        value: z.number().int(),
        minOrderCents: z.number().int().optional(),
        usageLimit: z.number().int().optional().nullable(),
        firstOrderOnly: z.boolean().optional(),
        endsAt: z.string().optional().nullable(),
      })
      .parse(await req.json());
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: body.value,
        minOrderCents: body.minOrderCents ?? 0,
        usageLimit: body.usageLimit,
        firstOrderOnly: body.firstOrderOnly ?? false,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
      },
    });
    await audit(auth.user.id, "create", "coupon", coupon.id);
    return json(coupon);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not create coupon", 400);
  }
}
