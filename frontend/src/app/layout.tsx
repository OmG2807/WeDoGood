import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "WeDoGood - NGO Impact Tracker",
  description: "Track and report the impact of NGO work across India",
  keywords: ["NGO", "impact", "tracker", "India", "reports", "dashboard"],
  authors: [{ name: "WeDoGood" }],
  openGraph: {
    title: "WeDoGood - NGO Impact Tracker",
    description: "Track and report the impact of NGO work across India",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-pattern min-h-screen">
        <Navigation />
        <ErrorBoundary>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
