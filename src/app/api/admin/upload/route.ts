import { requireAdminApi } from "@/lib/admin/guard";
import { error, json } from "@/lib/http";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const auth = await requireAdminApi("products");
  if (auth.error) return auth.error;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return error("No file", 400);
  if (file.size > 8_000_000) return error("File too large", 400);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"].includes(ext)) return error("Type not allowed", 400);
  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${nanoid(12)}.${ext}`;
  await writeFile(path.join(dir, name), buf);
  return json({ url: `/uploads/${name}` });
}
