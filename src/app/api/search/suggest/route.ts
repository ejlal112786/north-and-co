import { suggestSearch } from "@/lib/catalog";
import { json } from "@/lib/http";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || "";
  const data = await suggestSearch(q);
  return json(data);
}
