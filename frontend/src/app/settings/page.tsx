"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Settings, Save, CheckCircle2, Shield } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoReplyEnabled: true,
    systemPrompt: "",
    minDelay: 2,
    maxDelay: 5,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    try {
      const data = await fetchApi("/settings");
      setSettings({
        autoReplyEnabled: data.autoReplyEnabled,
        systemPrompt: data.systemPrompt || "",
        minDelay: data.minDelay || 2,
        maxDelay: data.maxDelay || 5,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await fetchApi("/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-400" /> AI Settings
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Configure your AI System Prompt and response delays.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl">
        {/* Toggle Auto-reply */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div>
            <h3 className="font-bold text-white text-base">Enable AI Auto-Reply</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automatically respond to incoming customer WhatsApp messages.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoReplyEnabled}
              onChange={(e) => setSettings({ ...settings, autoReplyEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-zinc-400 tracking-wider">
            System Prompt
          </label>
          <textarea
            rows={6}
            value={settings.systemPrompt}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
            placeholder="You are an AI assistant for customer support..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 leading-relaxed transition-all"
            required={settings.autoReplyEnabled}
          />
          <p className="text-xs text-zinc-500">
            Define your AI's persona, tone, instructions, and guardrails.
          </p>
        </div>

        {/* Response Delays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Minimum Delay (Seconds)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.minDelay}
              onChange={(e) => setSettings({ ...settings, minDelay: parseInt(e.target.value) || 2 })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Maximum Delay (Seconds)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={settings.maxDelay}
              onChange={(e) => setSettings({ ...settings, maxDelay: parseInt(e.target.value) || 5 })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            Configuration saved securely.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
