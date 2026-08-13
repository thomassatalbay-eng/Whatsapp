"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Key, Save, CheckCircle2, Shield, Eye, EyeOff } from "lucide-react";

export default function ApiKeyPage() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    try {
      const data = await fetchApi("/settings");
      setApiKey(data.groqApiKey || "");
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
        body: JSON.stringify({ groqApiKey: apiKey }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Failed to save API key");
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
          Enter your LLM API Key below to enable AI auto-replies.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl">
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase text-zinc-400 tracking-wider">
            API Key
          </label>

          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your LLM API Key..."
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

          <p className="text-xs text-zinc-500">
            Your key is stored securely and used exclusively for generating AI responses.
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
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> API Key Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save API Key
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
