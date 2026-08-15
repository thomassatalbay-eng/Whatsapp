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
    <div className="w-full space-y-8">
      {/* Header - Full Width */}
      <div className="w-full">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" /> AI Hospital Settings
        </h1>
        <p className="text-slate-600 mt-1 text-sm font-semibold">
          Configure your AI System Prompt knowledge base and response delays.
        </p>
      </div>

      {/* Form Card - Full Width */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm w-full">
        {/* Toggle Auto-reply */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 w-full">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Enable Patient AI Auto-Reply</h3>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Automatically respond to incoming WhatsApp messages from patients using AI.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoReplyEnabled}
              onChange={(e) => setSettings({ ...settings, autoReplyEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* System Prompt */}
        <div className="space-y-2 w-full">
          <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
            Hospital AI System Prompt Knowledge Base
          </label>
          <textarea
            rows={10}
            value={settings.systemPrompt}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
            placeholder="You are an AI assistant for Afzal Medical Complex..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white leading-relaxed transition-all"
            required={settings.autoReplyEnabled}
          />
          <p className="text-xs text-slate-500 font-semibold">
            Defines the hospital knowledge base, doctor consultation fees, procedure packages, and medical safety rules.
          </p>
        </div>

        {/* Response Delays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
              Minimum Delay (Seconds)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.minDelay}
              onChange={(e) => setSettings({ ...settings, minDelay: parseInt(e.target.value) || 2 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-red-600 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
              Maximum Delay (Seconds)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={settings.maxDelay}
              onChange={(e) => setSettings({ ...settings, maxDelay: parseInt(e.target.value) || 5 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-red-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 w-full">
          <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            Configuration saved securely.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all"
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
