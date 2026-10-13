import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Nunito, PT_Serif } from "next/font/google";

import { AutoRefresh } from "@/components/kiosk/auto-refresh";

import "./globals.css";

// Font variables consumed by the theme in globals.css:
// headings → Nunito, body → PT Serif, code → JetBrains Mono.
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const ptSerif = PT_Serif({ variable: "--font-pt-serif", subsets: ["latin"], weight: ["400", "700"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

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
    <html
      lang="en"
      className={`${nunito.variable} ${ptSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden">
        {children}
        <AutoRefresh />
      </body>
    </html>
  );
}
