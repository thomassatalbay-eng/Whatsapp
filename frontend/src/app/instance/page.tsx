"use client";

import { useState, useEffect } from "react";
import { fetchApi, getApiBaseUrl } from "@/lib/api";
import { Smartphone, QrCode, Power, RefreshCw, CheckCircle2, ShieldCheck, XCircle, Globe } from "lucide-react";

export default function InstancePage() {
  const [status, setStatus] = useState<string>("DISCONNECTED");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    setCurrentUrl(getApiBaseUrl());
  }, []);

  const pollStatus = async () => {
    try {
      const data = await fetchApi("/instance/status");
      setStatus(data.status);
      if (data.qr) {
        setQrCode(data.qr);
      } else if (data.status === "CONNECTED") {
        setQrCode(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSetBackendUrl = () => {
    const input = prompt("Enter your Render Backend URL (e.g. https://anthrix-backend.onrender.com):", currentUrl);
    if (input && input.trim()) {
      const clean = input.trim().replace(/\/$/, "");
      localStorage.setItem("CUSTOM_API_URL", clean);
      setCurrentUrl(clean);
      alert(`Backend URL set to: ${clean}`);
      pollStatus();
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await fetchApi("/instance/connect", { method: "POST" });
      await pollStatus();
    } catch (e: any) {
      const ask = confirm(`Could not reach backend at ${getApiBaseUrl()}.\n\nWould you like to enter your live Render backend URL?`);
      if (ask) {
        handleSetBackendUrl();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetchApi("/instance/disconnect", { method: "POST" });
      setStatus("DISCONNECTED");
      setQrCode(null);
    } catch (e) {
      alert("Failed to cancel connection");
    } finally {
      setLoading(false);
    }
  };

  const isConnected = status === "CONNECTED";
  const isConnecting = status === "CONNECTING";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-red-600" /> WhatsApp Channel
          </h1>
          <p className="text-slate-600 mt-1 text-sm font-semibold">
            Connect your WhatsApp account by scanning the QR code below.
          </p>
        </div>

        <button
          onClick={handleSetBackendUrl}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" /> Change Backend URL
        </button>
      </div>

      {/* Main Instance Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Channel ID</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">whatsapp-channel-01</div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isConnected
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : isConnecting
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-600 border border-slate-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-600 animate-pulse" : isConnecting ? "bg-amber-600 animate-ping" : "bg-slate-400"}`} />
              {status}
            </span>

            {isConnected ? (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <Power className="w-3.5 h-3.5" /> Disconnect
              </button>
            ) : isConnecting ? (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Connection
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                Connect WhatsApp
              </button>
            )}
          </div>
        </div>

        {/* QR Code display area */}
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50 border border-slate-200 min-h-[320px]">
          {isConnected ? (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">WhatsApp is Connected!</h3>
              <p className="text-sm text-slate-600 font-medium max-w-sm">
                Your WhatsApp number is actively connected. AI auto-replies will automatically respond to incoming customer messages.
              </p>
            </div>
          ) : qrCode ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl inline-block shadow-md border border-slate-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="WhatsApp QR Code" className="w-56 h-56" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Scan QR Code with WhatsApp</h3>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  Open WhatsApp on your phone → Linked Devices → Link a Device.
                </p>
              </div>

              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs inline-flex items-center gap-1.5 transition-all"
              >
                <XCircle className="w-3.5 h-3.5 text-slate-600" /> Cancel Connection
              </button>
            </div>
          ) : isConnecting ? (
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-700 font-semibold">Connecting and generating QR code...</p>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Connection
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Channel Disconnected</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Click "Connect WhatsApp" to start the QR code generator.</p>
              </div>
            </div>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>Encrypted session authentication and real-time synchronization.</span>
        </div>
      </div>
    </div>
  );
}
