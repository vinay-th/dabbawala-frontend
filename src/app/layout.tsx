import type { Metadata } from "next";
import "./globals.css";

// Fonts are loaded via Google Fonts <link> with the exact family names used by
// ref/landing.html and DESIGN.md (Instrument Serif, Geist, Geist Mono,
// Barlow Condensed, Tiro Devanagari Marathi). VERIFIED: same stylesheet URL as
// the reference artifact; loaded at runtime, no build-time network fetch.

export const metadata: Metadata = {
  title: "Dabbawala Protocol — bounded authority for delivery robots",
  description:
    "An open protocol for machines that move and spend: public ENS identity, metered x402 payments, verified 0G decisions, human approval gates and a permanent audit trail. Simulated city, cryptographically live rails.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router: the root layout renders on every route, so this <link> applies site-wide (the rule targets the Pages Router). */}
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Geist+Mono:wght@400;500;600&family=Geist:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=Tiro+Devanagari+Marathi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full theme-f0">{children}</body>
    </html>
  );
}
