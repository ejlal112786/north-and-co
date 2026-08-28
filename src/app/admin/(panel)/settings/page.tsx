import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { rapidEnabled } from "@/lib/rapid";

export default async function SettingsPage() {
  await requireAdmin("settings");
  const settings = await getSettings();
  return (
    <div>
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-2 text-sm text-muted">
        Rapid Gateway Pakistan Merchant ID and Secret Key live in environment variables, never in this form.
        Rapid configured: {rapidEnabled() ? "yes" : "no (COD still works)"}.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
