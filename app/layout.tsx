import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AutoRefresh } from "@/components/kiosk/auto-refresh";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guest Guide",
  description: "House guide for guests",
  robots: { index: false, follow: false },
};

// Kiosk: fill the screen exactly and block accidental pinch-zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/**
 * Full-screen kiosk shell. No nav bar, tabs or breadcrumbs: Home is a tile
 * grid and every other screen renders <ScreenHeader> with a Home button.
 * Each screen owns the viewport (h-dvh) and scrolls internally if needed.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex h-dvh flex-col overflow-hidden font-sans">
        {children}
        <AutoRefresh />
      </body>
    </html>
  );
}
