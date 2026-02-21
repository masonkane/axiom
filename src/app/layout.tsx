import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Groundwork — AI Implementation Intelligence",
  description: "Discover exactly how AI can transform your business. Custom implementation report in minutes, not months.",
  openGraph: {
    title: "Groundwork — AI Implementation Intelligence",
    description: "Discover exactly how AI can transform your business.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
