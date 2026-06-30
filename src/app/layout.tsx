import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ComexIA — Tu copiloto de comercio exterior con IA",
  description:
    "Documentación, normativa, aduanas y riesgos de tus importaciones y exportaciones, en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica el tema guardado antes de pintar para evitar parpadeo (FOUC). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tema')||'sistema';var d=t==='oscuro'||(t==='sistema'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
