import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validation";
import { assertSameOrigin, error, json } from "@/lib/http";
import { hashIp, getClientIp } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const ip = getClientIp(req.headers);
    const rl = rateLimit(`review:${ip}`, 6, 60 * 60 * 1000);
    if (!rl.ok) return error("Too many reviews from this network.", 429);
    const body = reviewSchema.parse(await req.json());
    const product = await prisma.product.findFirst({ where: { slug: body.productSlug, status: "PUBLISHED" } });
    if (!product) return error("Product not found", 404);
    const existing = await prisma.review.findFirst({
      where: { productId: product.id, authorEmail: body.authorEmail.toLowerCase() },
    });
    if (existing) return error("You already submitted a review for this product.", 400);
    let verified = false;
    let orderId: string | undefined;
    if (body.orderNumber) {
      const order = await prisma.order.findFirst({
        where: {
          orderNumber: body.orderNumber.trim().toUpperCase(),
          email: body.authorEmail.toLowerCase(),
          items: { some: { productSlug: product.slug } },
          status: { notIn: ["CANCELLED"] },
        },
      });
      if (order) {
        verified = true;
        orderId = order.id;
      }
    }
    await prisma.review.create({
      data: {
        productId: product.id,
        orderId,
        authorName: body.authorName.trim(),
        authorEmail: body.authorEmail.toLowerCase(),
        rating: body.rating,
        title: body.title || "",
        body: body.body,
        verified,
        status: "PENDING",
        ipHash: hashIp(ip),
      },
    });
    return json({ message: "Thanks. It will appear after the desk approves it." });
  } catch {
    return error("Could not submit review", 400);
  }
}
