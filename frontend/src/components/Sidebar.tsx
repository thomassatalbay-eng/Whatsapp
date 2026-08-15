"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Smartphone, MessageSquare, Settings, ShieldCheck, LogOut } from "lucide-react";

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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-white p-1 border-2 border-red-600 shrink-0 flex items-center justify-center shadow-sm">
              <Image
                src="/amc-logo.jpg"
                alt="Afzal Medical Complex Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-black text-sm text-slate-900 leading-tight">Afzal Medical</h1>
              <h2 className="font-bold text-xs text-red-600 leading-none">Complex & Trust</h2>
              <span className="inline-block mt-1 text-[9px] font-bold text-white tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-600">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer & Logout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
        <div className="flex items-center gap-2 text-xs text-blue-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> Patient Care Engine Active
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
