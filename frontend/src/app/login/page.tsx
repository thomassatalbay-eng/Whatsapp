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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header Logo & Title */}
        <div className="text-center space-y-4">
          <div className="inline-block p-2 rounded-2xl bg-white border-2 border-red-600 shadow-sm">
            <Image
              src="/amc-logo.jpg"
              alt="Afzal Medical Complex Logo"
              width={72}
              height={72}
              className="object-contain mx-auto"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Afzal Medical Complex</h1>
            <h2 className="text-sm font-bold text-red-600 tracking-wide">& Trust • D.I. Khan</h2>
            <p className="text-xs font-bold text-white tracking-wider mt-2 uppercase px-3 py-1 rounded bg-blue-600 inline-block">
              AI Patient Care Portal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow transition-all"
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
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-200 font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> Authorized Medical Personnel Only
        </div>
      </div>
    </div>
  );
}
