import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axiom — AI Implementation Intelligence",
  description: "Discover exactly how AI can transform your business. Get a custom implementation report in minutes, not months.",
  openGraph: {
    title: "Axiom — AI Implementation Intelligence",
    description: "Discover exactly how AI can transform your business.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
