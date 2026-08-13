"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Smartphone, MessageSquare, Settings, Bot, ShieldCheck } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "WhatsApp Channel", href: "/instance", icon: Smartphone },
    { name: "Live Inbox", href: "/chats", icon: MessageSquare },
    { name: "AI Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-none">Anthrix AI</h1>
            <span className="text-[10px] text-blue-400 font-medium tracking-wide">AUTOMATION SUITE</span>
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
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
          <ShieldCheck className="w-4 h-4" /> System Online & Active
        </div>
        <p className="text-[11px] text-zinc-500">
          Continuous AI Messaging Engine.
        </p>
      </div>
    </aside>
  );
}
