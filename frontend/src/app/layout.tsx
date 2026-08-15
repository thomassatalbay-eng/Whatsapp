import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Afzal Medical Complex - AI Patient Portal",
  description: "Automated AI Customer Service for Afzal Medical Complex & Trust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 flex min-h-screen font-sans">
        <AuthGuard>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </AuthGuard>
      </body>
    </html>
  );
}
