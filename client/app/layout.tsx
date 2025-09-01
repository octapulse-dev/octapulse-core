/**
 * Root layout for the OctaPulse application
 */

import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ClientProviders } from "@/components/providers/ClientProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OctaPulse - Aquaculture Fish Analysis",
  description: "Professional aquaculture fish analysis platform using advanced computer vision and AI",
  keywords: ["aquaculture", "fish analysis", "computer vision", "AI", "measurements"],
  authors: [{ name: "OctaPulse Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} antialiased min-h-screen`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          expand={true}
          richColors
        />
      </body>
    </html>
  );
}
