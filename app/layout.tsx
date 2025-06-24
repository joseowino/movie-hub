import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "CineVault - Movie & TV Discovery Platform",
  description: "Discover trending movies and TV shows, manage your personal watchlist, and explore entertainment content with detailed ratings and information.",
  keywords: "movies, tv shows, entertainment, watchlist, discovery, ratings, TMDB",
  authors: [{ name: "CineVault" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
        <body className={`${inter.className} antialiased`}>
          {children}
          <Toaster />
        </body>
    </html>
  );
}