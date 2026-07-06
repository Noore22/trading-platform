import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Providers from "./providers";
import ErrorBoundary from "../components/layout/ErrorBoundary";

export const metadata: Metadata = {
  title: "AntiGravity AI Trading Platform V4",
  description: "Institutional-grade AI Forex & Crypto Trading Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-gray-100 min-h-screen selection:bg-primary/30 selection:text-white antialiased">
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
