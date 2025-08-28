/**
 * Root layout for the OctaPulse application
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {/* Header with glassmorphism */}
        <header className="glass fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center pulse-glow">
                  <span className="text-white font-bold text-lg tech-mono">O</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text tech-mono tracking-wide">
                    OctaPulse
                  </h1>
                  <p className="text-xs text-slate-400 tech-mono uppercase tracking-widest">
                    Aquaculture Analysis Platform
                  </p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-8">
                <a href="/" className="text-slate-300 hover:text-sky-400 transition-all duration-300 tech-mono text-sm font-medium tracking-wide relative group">
                  Analyze
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="/batch" className="text-slate-300 hover:text-emerald-400 transition-all duration-300 tech-mono text-sm font-medium tracking-wide relative group">
                  Batch Analysis
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="/docs" className="text-slate-300 hover:text-cyan-400 transition-all duration-300 tech-mono text-sm font-medium tracking-wide relative group">
                  Documentation
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer with glassmorphism */}
        <footer className="glass border-t border-slate-700/50 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <p className="text-slate-300 tech-mono text-sm">
                  &copy; 2024 <span className="gradient-text font-bold">OctaPulse</span>
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-400 tech-mono">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span>YOLOv8</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                    <span>FastAPI</span>
                  </span>
                  <span>•</span>
                  <span className="text-cyan-400">v1.0.0</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-xs text-slate-400 tech-mono">
                Professional Aquaculture Analysis Platform
              </div>
            </div>
          </div>
        </footer>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#DC2626',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
