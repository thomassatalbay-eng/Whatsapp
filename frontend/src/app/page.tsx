"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchApi } from "@/lib/api";
import { Smartphone, Bot, MessageSquare, Zap, Activity, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";
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
    <div className="space-y-8 w-full">
      {/* Header - Full Width */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-2xl bg-white border-2 border-red-600 shadow-sm shrink-0">
            <Image
              src="/amc-logo.jpg"
              alt="Afzal Medical Complex Logo"
              width={54}
              height={54}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Afzal Medical Complex & Trust</h1>
            <p className="text-slate-600 text-xs font-semibold mt-0.5">
              Dera Ismail Khan • Patient Care & AI Messaging Suite
            </p>
          </div>
        </div>

        <Link
          href="/instance"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm transition-all text-xs"
        >
          Manage Channel <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Stats Grid - Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {/* Status Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            WhatsApp Status
            <Smartphone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : isConnecting ? (
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
            )}
            <span className="text-lg font-bold text-slate-900">
              {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
            </span>
          </div>
        </div>

        {/* AI Auto-reply Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            Patient AI Assistant
            <Bot className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {settings?.autoReplyEnabled ? (
              <span className="text-emerald-600 flex items-center gap-1.5 text-base font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" /> Active
              </span>
            ) : (
              <span className="text-slate-400 text-base font-bold">Disabled</span>
            )}
          </div>
        </div>

        {/* Total Conversations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            Patient Enquiries
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {conversations.length}
          </div>
        </div>

        {/* LLM Key Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            LLM API Key
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-slate-900">
            {settings?.groqApiKey ? (
              <span className="text-emerald-600">Configured ✅</span>
            ) : (
              <span className="text-amber-600">Not Set ⚠️</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid - Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Patient Care Banner */}
        <div className="p-6 rounded-3xl bg-white border-2 border-red-600 lg:col-span-2 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4 text-blue-600" /> Automated Patient Guidance Engine
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Afzal Medical Complex & Trust Knowledge Base</h2>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            Automatically guides patients regarding laparoscopic surgeries, C-Section packages, PCNL/URS/TURP procedures, diagnostic facilities, doctor consultation fees, and emergency visit disclaimers.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/settings"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all"
            >
              Configure Hospital Prompt
            </Link>
            <Link
              href="/chats"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Open Patient Inbox
            </Link>
          </div>
        </div>

        {/* Hospital Overview */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Hospital Details
          </h3>
          <div className="space-y-3 text-xs text-slate-600 font-semibold">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span>Institution</span>
              <span className="text-slate-900 font-bold">Afzal Medical Complex</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span>Location</span>
              <span className="text-red-600 font-bold">Dera Ismail Khan</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span>Sehat Card</span>
              <span className="text-amber-600 font-bold">Not Available</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-emerald-600 font-bold">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
