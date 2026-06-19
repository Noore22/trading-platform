import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "MT5 Algo Trading Platform",
  description: "Real-time MetaTrader 5 bot controller and analytics dashboard.",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0b0e11] text-gray-100 min-h-screen selection:bg-primary selection:text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
