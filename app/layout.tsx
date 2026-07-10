'use client';

import type { Metadata } from "next";
import { Suspense } from "react";
import FlashToast from "@/components/FlashToast";

import "./globals.css";

// export const metadata: Metadata = {
//   title: "Desafio de Geografia",
//   description: "Juego educativo interactivo de geografia mundial",
// };

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0a0f1a] text-white antialiased">
        {children}
        <Suspense>
          <FlashToast />
        </Suspense>
      </body>
    </html>
  );
}
