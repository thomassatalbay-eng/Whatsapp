import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Afzal Medical Complex - AI Messaging Suite",
  description: "Automated AI Customer Service for Afzal Medical Complex & Trust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 flex min-h-screen">
        <AuthGuard>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </AuthGuard>
      </body>
    </html>
  );
}
