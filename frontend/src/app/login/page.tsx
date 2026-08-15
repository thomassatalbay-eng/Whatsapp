"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Lock, User, LogIn, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetchApi("/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (res.token) {
        localStorage.setItem("auth_token", res.token);
        router.push("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-3xl border-2 border-slate-800 shadow-2xl shadow-red-950/20">
        {/* Header Logo & Title */}
        <div className="text-center space-y-4">
          <div className="inline-block p-2 rounded-2xl bg-white border-2 border-red-600 shadow-lg shadow-red-900/30">
            <Image
              src="/amc-logo.jpg"
              alt="Afzal Medical Complex Logo"
              width={72}
              height={72}
              className="object-contain mx-auto"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Afzal Medical Complex</h1>
            <h2 className="text-sm font-bold text-red-500 tracking-wide">& Trust • D.I. Khan</h2>
            <p className="text-xs text-blue-400 font-medium tracking-wider mt-1.5 uppercase">
              AI Patient Care Administrator Portal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-all"
                required
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-blue-700 hover:from-red-500 hover:to-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Secure Admin Login
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-3 border-t border-slate-800">
          <ShieldCheck className="w-4 h-4 text-blue-400" /> Authorized Medical Personnel Only
        </div>
      </div>
    </div>
  );
}
