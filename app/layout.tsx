import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "PropertySystems | Real estate reimagined",
  description:
    "Discover, list, and manage properties effortlessly with PropertySystems, built for modern real estate teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <div className="min-h-screen">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
