import { quoteShipping } from "@/lib/shipping";
import { json, error } from "@/lib/http";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { country, subtotal } = z
      .object({ country: z.string().min(2).max(2), subtotal: z.number().int().min(0) })
      .parse(await req.json());
    const quotes = await quoteShipping(country, subtotal);
    return json({ quotes });
  } catch {
    return error("Could not quote shipping", 400);
  }
}
