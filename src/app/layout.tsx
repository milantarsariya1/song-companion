import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lyriqa - Premium AI Lyrics Finder & Companion",
  description: "Search lyrics, translate instantly, and explore song meanings with an advanced AI chatbot powered by Groq.",
  keywords: ["lyrics", "lyrics search", "lyrics translator", "AI lyrics assistant", "Lyriqa", "song meanings"],
  authors: [{ name: "Lyriqa Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
