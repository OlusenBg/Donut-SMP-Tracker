import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import AmbientBackground from "@/components/AmbientBackground";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Donut SMP Tracker — Auction House Prices",
  description:
    "Live-ish auction house price tracking for Donut SMP. Search items, watch the market, never overpay.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="font-display bg-donut-950 bg-grid min-h-screen antialiased">
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
