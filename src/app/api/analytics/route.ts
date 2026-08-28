import { track } from "@/lib/analytics";
import { json } from "@/lib/http";
import { cookies } from "next/headers";
import { z } from "zod";

export async function POST(req: Request) {
  const jar = await cookies();
  const sid = jar.get("nc_sid")?.value || "";
  const body = z
    .object({
      type: z.string().min(1).max(40),
      path: z.string().max(200).optional(),
      meta: z.record(z.string(), z.unknown()).optional(),
    })
    .safeParse(await req.json().catch(() => ({})));
  if (body.success) {
    await track(body.data.type, body.data.meta || {}, sid, body.data.path || "");
  }
  return json({ ok: true });
}
