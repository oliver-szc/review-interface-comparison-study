import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DebugConsole } from "@/components/ui/DebugConsole";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Review Study Platform",
  description: "Research study comparing review interfaces",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-screen overflow-hidden">
      <body className={`${inter.className} bg-white text-slate-950 selection:bg-indigo-100 h-full flex flex-col overflow-hidden`}>
        <div className="flex-1 overflow-y-auto min-h-0 relative">
          {children}
        </div>
        {/* Debug console is rendered here and is only visible when STUDY_DEBUG_MODE is set in localStorage */}
        <DebugConsole />
      </body>
    </html>
  );
}
