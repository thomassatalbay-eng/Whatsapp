"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Smartphone, Bot, MessageSquare, Zap, Activity, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [status, setStatus] = useState<string>("DISCONNECTED");
  const [settings, setSettings] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [st, set, chats] = await Promise.all([
        fetchApi("/instance/status"),
        fetchApi("/settings"),
        fetchApi("/chats"),
      ]);
      setStatus(st.status);
      setSettings(set);
      setConversations(chats);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = status === "CONNECTED";
  const isConnecting = status === "CONNECTING";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Anthrix AI • Social Media Messaging Automation
          </p>
        </div>

        <Link
          href="/instance"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all text-sm"
        >
          Manage Channel <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Status Card */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            WhatsApp Status
            <Smartphone className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : isConnecting ? (
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-zinc-500 shrink-0" />
            )}
            <span className="text-lg font-bold text-white">
              {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
            </span>
          </div>
        </div>

        {/* AI Auto-reply Card */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            AI Auto-Reply
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            {settings?.autoReplyEnabled ? (
              <span className="text-emerald-400 flex items-center gap-1.5 text-base">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            ) : (
              <span className="text-zinc-500 text-base">Disabled</span>
            )}
          </div>
        </div>

        {/* Total Conversations */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Active Chats
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {conversations.length}
          </div>
        </div>

        {/* LLM Key Status */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            LLM API Key
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white">
            {settings?.groqApiKey ? (
              <span className="text-emerald-400">Configured ✅</span>
            ) : (
              <span className="text-amber-400">Not Set ⚠️</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Action Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-zinc-900 border border-blue-500/20 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <Activity className="w-4 h-4" /> AI Support Automation
          </div>
          <h2 className="text-xl font-bold text-white">Automate Customer Inquiries 24/7</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Anthrix AI automatically manages incoming customer messages, answers questions instantly using your custom instructions, and lets you step in for manual replies whenever needed.
          </p>

          <div className="flex gap-4 pt-2">
            <Link
              href="/settings"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-all"
            >
              Configure Prompt & LLM Key
            </Link>
            <Link
              href="/chats"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-all"
            >
              Open Live Inbox
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="font-bold text-zinc-200 text-base">Channel Information</h3>
          <div className="space-y-3 text-xs text-zinc-400">
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span>Channel Name</span>
              <span className="text-zinc-200 font-medium">WhatsApp Business</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span>Platform</span>
              <span className="text-emerald-400 font-medium">WhatsApp</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span>AI Provider</span>
              <span className="text-purple-400 font-medium">Advanced LLM</span>
            </div>
            <div className="flex justify-between">
              <span>System Status</span>
              <span className="text-blue-400 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
