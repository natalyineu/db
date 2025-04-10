import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./providers";
import Link from "next/link";

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
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full bg-indigo-700 text-white py-2 px-4 flex items-center justify-between shadow-md">
          <div className="flex items-center">
            <Link 
              href="https://ai-vertise.com" 
              target="_blank"
              rel="noopener"
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <span className="font-bold text-xl">AI-Vertise</span>
              <span className="mx-2 text-xs bg-white text-indigo-700 px-2 py-0.5 rounded-full">Account</span>
            </Link>
          </div>
          <div>
            <Link 
              href="https://ai-vertise.com" 
              target="_blank"
              rel="noopener"
              className="text-xs text-indigo-200 hover:text-white transition-colors"
            >
              Back to main site
            </Link>
          </div>
        </header>
        <main className="flex-grow">
          <ClientProviders>
            {children}
          </ClientProviders>
        </main>
      </body>
    </html>
  );
}
