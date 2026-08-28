import { cartSummary } from "@/lib/cart";
import { json } from "@/lib/http";

export async function GET() {
  const summary = await cartSummary();
  return json(summary);
}
