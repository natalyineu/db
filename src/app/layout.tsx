import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./providers";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI-Vertise Account System",
  description: "Secure personal account system powered by AI-Vertise",
  other: {
    "referrer": "no-referrer"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="min-h-screen theme-transition dark:bg-gray-900 bg-gray-50 flex flex-col">
        <ClientProviders>
          <header className="w-full bg-card shadow-app-sm dark:bg-card text-primary dark:text-primary py-4 px-4 flex items-center justify-between border-b border-app">
            <div className="flex items-center">
              <Link 
                href="https://ai-vertise.com" 
                target="_blank"
                rel="noopener"
                className="flex items-center hover:opacity-90 transition-opacity"
              >
                <span className="font-bold text-2xl">
                  <span className="ai-vertise-gradient-text">AI-Vertise</span>
                  <span className="mx-2 text-sm ai-vertise-gradient-indigo text-white px-2 py-0.5 rounded-full">Account</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href="https://ai-vertise.com" 
                target="_blank"
                rel="noopener"
                className="text-sm px-4 py-2 rounded-full ai-vertise-gradient-bg text-white hover:opacity-90 transition-opacity"
              >
                Back to main site
              </Link>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
