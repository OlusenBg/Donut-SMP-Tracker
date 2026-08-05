import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import AmbientBackground from "@/components/AmbientBackground";
import OnboardingModal from "@/components/OnboardingModal";
import { THEME_INIT_SCRIPT } from "@/lib/preferences";
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
    // suppressHydrationWarning is required here: THEME_INIT_SCRIPT sets
    // data-theme on this element before React hydrates (to avoid a flash
    // of the default theme), which would otherwise trigger a hydration
    // mismatch warning/error since the server never rendered that
    // attribute. This only suppresses the warning for this element's own
    // attributes, not for its children.
    <html lang="en" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-display bg-donut-950 bg-grid min-h-screen antialiased">
        <AmbientBackground />
        {children}
        <OnboardingModal />
      </body>
    </html>
  );
}
