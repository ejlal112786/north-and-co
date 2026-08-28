import { requireAdminApi } from "@/lib/admin/guard";
import { setSetting, clearSettingsCache } from "@/lib/settings";
import { audit } from "@/lib/auth";
import { json, error } from "@/lib/http";

export async function POST(req: Request) {
  const auth = await requireAdminApi("settings");
  if (auth.error) return auth.error;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    for (const [key, value] of Object.entries(body)) {
      await setSetting(key, value);
    }
    clearSettingsCache();
    await audit(auth.user.id, "update", "settings", undefined, body);
    return json({ ok: true });
  } catch {
    return error("Could not save", 400);
  }
}
