import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ReviewMod } from "@/components/admin/ReviewMod";

export default async function ReviewsAdmin() {
  await requireAdmin("reviews");
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true },
    take: 80,
  });
  return (
    <div>
      <h1 className="font-serif text-4xl">Reviews</h1>
      <ReviewMod reviews={JSON.parse(JSON.stringify(reviews))} />
    </div>
  );
}
