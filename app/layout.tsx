import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import FlashToast from "@/components/FlashToast";

export const metadata: Metadata = {
  title: "Desafio de Geografia",
  description: "Juego educativo interactivo de geografia mundial",
};

// Se ejecuta en el <head> antes de pintar: aplica el tema guardado (o el del
// sistema) para evitar el parpadeo de tema incorrecto (FOUC). Ver:
// node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-text antialiased">
        {children}
        <Suspense>
          <FlashToast />
        </Suspense>
      </body>
    </html>
  );
}
