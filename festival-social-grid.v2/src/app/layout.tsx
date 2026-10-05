import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { festival } from "@/config/festival";
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
  title: festival.name,
  description: `Armá tu grilla para ${festival.name}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-white font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
