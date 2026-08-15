"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Key, Save, CheckCircle2, Shield, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ApiKeyPage() {
  const [apiKey, setApiKey] = useState("");
  const [backupApiKey, setBackupApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showBackupKey, setShowBackupKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    try {
      const data = await fetchApi("/settings");
      setApiKey(data.groqApiKey || "");
      setBackupApiKey(data.backupGroqApiKey || "");
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
        body: JSON.stringify({
          groqApiKey: apiKey,
          backupGroqApiKey: backupApiKey
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Failed to save API keys");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Key className="w-8 h-8 text-amber-400" /> LLM API Key Configuration
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Configure Primary & Backup API Keys for 100% failover uptime.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl">
        {/* Primary API Key */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase text-zinc-400 tracking-wider">
            Primary API Key
          </label>

          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Primary API Key..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Backup API Key */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Backup API Key (Optional Failover)
            </label>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Auto-Failover Enabled
            </span>
          </div>

          <div className="relative">
            <input
              type={showBackupKey ? "text" : "password"}
              value={backupApiKey}
              onChange={(e) => setBackupApiKey(e.target.value)}
              placeholder="Enter Backup API Key (Optional)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowBackupKey(!showBackupKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showBackupKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-zinc-500">
            If Primary API Key reaches daily limits, the system will automatically switch to the Backup Key without dropping messages!
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            Encrypted Storage
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> API Keys Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save API Keys
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
