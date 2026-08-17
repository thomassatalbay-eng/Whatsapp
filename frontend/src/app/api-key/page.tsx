"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Key, Save, CheckCircle2, Shield, Eye, EyeOff, ShieldCheck, Sparkles, Zap, Bot } from "lucide-react";

export default function ApiKeyPage() {
  const [aiProvider, setAiProvider] = useState<"groq" | "gemini" | "openrouter">("groq");
  const [apiKey, setApiKey] = useState("");
  const [backupApiKey, setBackupApiKey] = useState("");
  const [backupApiKey2, setBackupApiKey2] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");

  const [showKey, setShowKey] = useState(false);
  const [showBackupKey, setShowBackupKey] = useState(false);
  const [showBackupKey2, setShowBackupKey2] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    try {
      const data = await fetchApi("/settings");
      setAiProvider(data.aiProvider || "groq");
      setApiKey(data.groqApiKey || "");
      setBackupApiKey(data.backupGroqApiKey || "");
      setBackupApiKey2(data.backupGroqApiKey2 || "");
      setGeminiApiKey(data.geminiApiKey || "");
      setOpenRouterApiKey(data.openRouterApiKey || "");
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
          aiProvider,
          groqApiKey: apiKey,
          backupGroqApiKey: backupApiKey,
          backupGroqApiKey2: backupApiKey2,
          geminiApiKey,
          openRouterApiKey
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
    <div className="w-full space-y-8 pt-2">
      {/* Header */}
      <div className="w-full">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Key className="w-8 h-8 text-amber-500" /> LLM API Key Configuration
        </h1>
        <p className="text-slate-600 mt-1 text-sm font-semibold">
          Choose your AI Provider and configure your API Keys securely.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-slate-200 space-y-8 shadow-sm w-full">

        {/* Provider Selection */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
            AI Provider
          </label>
          <div className="grid grid-cols-3 gap-4">
            {/* LLM (Groq) */}
            <button
              type="button"
              onClick={() => setAiProvider('groq')}
              className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${
                aiProvider === 'groq'
                  ? 'border-red-600 bg-red-50 text-red-900 shadow-sm'
                  : 'border-slate-200 hover:border-red-300 hover:bg-slate-50'
              }`}
            >
              <Zap className={`w-5 h-5 mt-0.5 flex-shrink-0 ${aiProvider === 'groq' ? 'text-red-600' : 'text-slate-400'}`} />
              <div>
                <div className="font-bold">LLM</div>
                <div className="text-xs mt-1 opacity-80">Standard LLM Model</div>
              </div>
            </button>

            {/* Gemini */}
            <button
              type="button"
              onClick={() => setAiProvider('gemini')}
              className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${
                aiProvider === 'gemini'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <Sparkles className={`w-5 h-5 mt-0.5 flex-shrink-0 ${aiProvider === 'gemini' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <div className="font-bold">Google Gemini</div>
                <div className="text-xs mt-1 opacity-80">Gemini 3.7 Flash</div>
              </div>
            </button>

            {/* OpenRouter / Qwen3 */}
            <button
              type="button"
              onClick={() => setAiProvider('openrouter')}
              className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${
                aiProvider === 'openrouter'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                  : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <Bot className={`w-5 h-5 mt-0.5 flex-shrink-0 ${aiProvider === 'openrouter' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <div className="font-bold">OpenRouter</div>
                <div className="text-xs mt-1 opacity-80">Qwen3 8B (Free)</div>
              </div>
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200"></div>

        {/* Dynamic Fields */}
        <div className="space-y-6">
          {aiProvider === 'gemini' && (
            /* GEMINI FIELD */
            <div className="space-y-3 w-full">
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                Gemini API Key
              </label>
              <div className="relative w-full">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Enter Gemini API Key..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  required
                />
                <button type="button" onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 font-semibold">Get your free Gemini API Key from Google AI Studio (aistudio.google.com).</p>
            </div>
          )}

          {aiProvider === 'openrouter' && (
            /* OPENROUTER FIELD */
            <div className="space-y-3 w-full">
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                OpenRouter API Key
              </label>
              <div className="relative w-full">
                <input
                  type={showOpenRouterKey ? "text" : "password"}
                  value={openRouterApiKey}
                  onChange={(e) => setOpenRouterApiKey(e.target.value)}
                  placeholder="Enter OpenRouter API Key..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  required
                />
                <button type="button" onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 font-semibold">Get your free OpenRouter API Key from openrouter.ai. Uses Qwen3 8B (free tier).</p>
            </div>
          )}

          {aiProvider === 'groq' && (
            /* GROQ FIELDS */
            <>
              {/* Primary */}
              <div className="space-y-3 w-full">
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">Primary API Key (#1)</label>
                <div className="relative w-full">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Primary API Key..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Backup #1 */}
              <div className="space-y-3 pt-2 w-full">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">Backup API Key #1 (Secondary Failover)</label>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Tier 2 Failover</span>
                </div>
                <div className="relative w-full">
                  <input
                    type={showBackupKey ? "text" : "password"}
                    value={backupApiKey}
                    onChange={(e) => setBackupApiKey(e.target.value)}
                    placeholder="Enter Backup API Key #1 (Optional)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                  />
                  <button type="button" onClick={() => setShowBackupKey(!showBackupKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showBackupKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Backup #2 */}
              <div className="space-y-3 pt-2 w-full">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">Backup API Key #2 (Tertiary Failover)</label>
                  <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Tier 3 Failover</span>
                </div>
                <div className="relative w-full">
                  <input
                    type={showBackupKey2 ? "text" : "password"}
                    value={backupApiKey2}
                    onChange={(e) => setBackupApiKey2(e.target.value)}
                    placeholder="Enter Backup API Key #2 (Optional)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                  />
                  <button type="button" onClick={() => setShowBackupKey2(!showBackupKey2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showBackupKey2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-semibold">The AI engine automatically rotates across Key #1 → Key #2 → Key #3 if daily limits are reached!</p>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 w-full">
          <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            Encrypted Storage
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all ${
              aiProvider === 'gemini' ? 'bg-blue-600 hover:bg-blue-700'
              : aiProvider === 'openrouter' ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Settings Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save API Settings</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
