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
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-emerald-400" /> WhatsApp Channel
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Connect your WhatsApp account by scanning the QR code below.
          </p>
        </div>

        <button
          onClick={handleSetBackendUrl}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs flex items-center gap-2 transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" /> Change Backend URL
        </button>
      </div>

      {/* Main Instance Card */}
      <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Channel ID</div>
            <div className="text-lg font-bold text-white mt-0.5">whatsapp-channel-01</div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : isConnecting
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : isConnecting ? "bg-amber-400 animate-ping" : "bg-zinc-500"}`} />
              {status}
            </span>

            {isConnected ? (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-600/15 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-medium text-xs flex items-center gap-2 transition-all"
              >
                <Power className="w-3.5 h-3.5" /> Disconnect
              </button>
            ) : isConnecting ? (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-600/15 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-medium text-xs flex items-center gap-2 transition-all"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Connection
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                Connect WhatsApp
              </button>
            )}
          </div>
        </div>

        {/* QR Code display area */}
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-950 border border-zinc-800/80 min-h-[320px]">
          {isConnected ? (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">WhatsApp is Connected!</h3>
              <p className="text-sm text-zinc-400 max-w-sm">
                Your WhatsApp number is actively connected. AI auto-replies will automatically respond to incoming customer messages.
              </p>
            </div>
          ) : qrCode ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl ring-4 ring-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="WhatsApp QR Code" className="w-56 h-56" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Scan QR Code with WhatsApp</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Open WhatsApp on your phone → Linked Devices → Link a Device.
                </p>
              </div>

              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-medium text-xs inline-flex items-center gap-1.5 transition-all"
              >
                <XCircle className="w-3.5 h-3.5 text-zinc-400" /> Cancel Connection
              </button>
            </div>
          ) : isConnecting ? (
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">Connecting and generating QR code...</p>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-600/15 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-medium text-xs inline-flex items-center gap-1.5 transition-all"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Connection
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-zinc-900 text-zinc-600 rounded-full flex items-center justify-center mx-auto">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-300 text-base">Channel Disconnected</h3>
                <p className="text-xs text-zinc-500 mt-1">Click "Connect WhatsApp" to start the QR code generator.</p>
              </div>
            </div>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Encrypted session authentication and real-time synchronization.</span>
        </div>
      </div>
    </div>
  );
}
