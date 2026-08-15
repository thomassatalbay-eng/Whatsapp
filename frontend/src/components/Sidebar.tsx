"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Smartphone, MessageSquare, Settings, ShieldCheck, LogOut, Cross, Key } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "WhatsApp Channel", href: "/instance", icon: Smartphone },
    { name: "Live Patient Inbox", href: "/chats", icon: MessageSquare },
    { name: "AI Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-white p-1 shadow-md shadow-red-950/30 border-2 border-red-600 overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src="/amc-logo.jpg"
                alt="Afzal Medical Complex Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white leading-tight tracking-tight">Afzal Medical</h1>
              <h2 className="font-bold text-xs text-red-500 leading-none">Complex & Trust</h2>
              <span className="inline-block mt-1 text-[9px] font-bold text-blue-400 tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/50">
                D.I. Khan • AI Suite
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-red-600/20 to-blue-600/20 text-white border border-red-500/40 font-bold shadow-lg shadow-red-950/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-red-500" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-400" /> Patient Care Engine Active
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-red-600/15 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4 text-red-500" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
