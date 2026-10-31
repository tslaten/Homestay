import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Nunito, PT_Serif } from "next/font/google";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Shared root: fonts and theme only. The guest screens live in app/(kiosk)
 * and the host's editor in app/(admin); each group's layout sets its own feel.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${ptSerif.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
