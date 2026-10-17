import type { Metadata } from "next";
import { getSozlamalar } from "@/lib/data";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSozlamalar();
  return { title: s.sarlavha, description: s.tavsif || "Oila shajarasi" };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Alegreya:wght@500;700&family=Alegreya+Sans:wght@400;500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
