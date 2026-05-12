"use client";
import { useEffect, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import type { AppSettings } from "@/types";

const DEFAULTS: AppSettings = {
  maintenance_mode: false,
  max_upload_size_mb: 10,
  allowed_file_types: ["image/jpeg", "image/png", "image/webp"],
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSettings({ ...DEFAULTS, ...j.settings }); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) toast("success", "Settings saved.");
    else toast("error", "Save failed.");
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">App-wide configuration. Changes take effect immediately.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">

        {/* Maintenance mode */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Maintenance Mode</p>
            <p className="text-xs text-gray-500 mt-0.5">Prevent non-admins from using the app.</p>
          </div>
          <Switch.Root
            checked={settings.maintenance_mode}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, maintenance_mode: v }))}
            className="relative h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors data-[state=checked]:bg-flora-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flora-600"
            aria-label="Maintenance mode toggle"
          >
            <Switch.Thumb className="block h-5 w-5 rounded-full bg-white shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-5.5" />
          </Switch.Root>
        </div>

        {/* Max upload size */}
        <div>
          <Input
            label="Max Upload Size (MB)"
            type="number"
            min={1}
            max={50}
            value={settings.max_upload_size_mb}
            onChange={(e) => setSettings((s) => ({ ...s, max_upload_size_mb: Number(e.target.value) }))}
            hint="Maximum image file size accepted for scans."
          />
        </div>

        {/* Allowed file types */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Allowed File Types</label>
          <div className="flex flex-wrap gap-2">
            {["image/jpeg", "image/png", "image/webp"].map((type) => {
              const checked = settings.allowed_file_types.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSettings((s) => ({
                    ...s,
                    allowed_file_types: checked
                      ? s.allowed_file_types.filter((t) => t !== type)
                      : [...s.allowed_file_types, type],
                  }))}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    checked
                      ? "border-flora-600 bg-flora-50 text-flora-700"
                      : "border-gray-300 text-gray-500 hover:border-gray-400"
                  }`}
                  aria-pressed={checked}
                >
                  {type.split("/")[1].toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={handleSave} loading={saving} className="w-full">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
