import { prisma } from "@/lib/prisma";
import { assertSameOrigin, error, json } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";
import { mailDeskNotice } from "@/lib/mail";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const rl = rateLimit(`contact:${getClientIp(req.headers)}`, 5, 60 * 60 * 1000);
    if (!rl.ok) return error("Too many messages", 429);
    const body = z
      .object({
        name: z.string().min(2).max(80),
        email: z.string().email(),
        phone: z.string().max(30).optional().default(""),
        message: z.string().min(8).max(2000),
      })
      .parse(await req.json());
    await prisma.contactMessage.create({ data: body });
    await mailDeskNotice(
      `Contact — ${body.name}`,
      `<p><strong>${body.name}</strong> &lt;${body.email}&gt;</p>
       <p>Phone: ${body.phone || "—"}</p>
       <p>${body.message.replaceAll("\n", "<br/>")}</p>`,
      "contact"
    );
    return json({ message: "Received. We emailed the desk and stored the message." });
  } catch {
    return error("Could not send", 400);
  }
}
