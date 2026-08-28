import { prisma } from "@/lib/prisma";
import { assertSameOrigin, error, json } from "@/lib/http";
import { mailDeskNotice } from "@/lib/mail";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { email } = z.object({ email: z.string().email() }).parse(await req.json());
    await prisma.newsletter.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { email: email.toLowerCase() },
    });
    await mailDeskNotice(
      `Newsletter — ${email}`,
      `<p>${email} joined the list.</p>`,
      "newsletter"
    );
    return json({ message: "You are on the list." });
  } catch {
    return error("Could not save email", 400);
  }
}
