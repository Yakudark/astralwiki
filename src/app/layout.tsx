import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keep Geist, it's modern
import "./globals.css";
import { AppSidebar } from "@/components/layout/AppSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AstralRP Wiki | Documentation Officielle",
  description: "La source de vérité pour l'univers AstralRP. Règles, Lore, et Guides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark"> {/* Force Dark Mode */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen selection:bg-primary/30 selection:text-primary`}
      >
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 md:pl-64 transition-all duration-300 ease-in-out">
             <div className="container mx-auto max-w-5xl p-6 md:p-10 fade-in-section">
                {children}
             </div>
          </main>
        </div>
      </body>
    </html>
  );
}
