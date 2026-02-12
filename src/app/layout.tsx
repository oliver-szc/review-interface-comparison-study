import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en">
      <body className={`${inter.className} bg-white text-slate-950 selection:bg-indigo-100`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
