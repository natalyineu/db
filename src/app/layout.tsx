import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./providers";
import Link from "next/link";
import { UserMenu } from "@/components/ui";
import AuthLinks from "@/components/AuthLinks";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI-Vertise - AI-Powered Brief Management",
  description: "The most advanced AI brief management platform for 2025",
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="referrer" content="no-referrer" />
        <meta name="description" content="The most advanced AI-powered brief management platform, designed for the digital marketers of 2025." />
      </head>
      <body className="min-h-screen theme-transition bg-gray-50 flex flex-col" suppressHydrationWarning>
        <ClientProviders>
          <header className="w-full py-4 px-6 md:px-8 flex items-center justify-between border-b border-app theme-transition backdrop-blur-sm bg-white/90 sticky top-0 z-50">
            <div className="flex items-center">
              <Link 
                href="/"
                className="flex items-center hover:opacity-90 transition-opacity"
              >
                <span className="font-bold text-xl md:text-2xl">
                  <span className="ai-vertise-gradient-text">AI-Vertise</span>
                  <span className="ml-2 text-xs md:text-sm ai-vertise-gradient-indigo text-white px-2 py-0.5 rounded-full">2025</span>
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden ml-12 md:flex space-x-8">
                {[
                  { label: 'Briefs', href: '/data' },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
              {/* User Menu (displays only when authenticated) */}
              <UserMenu />
              
              {/* Auth links (dynamic client component) */}
              <AuthLinks />
              
              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </header>
          
          <main className="flex-grow">
            {children}
          </main>
          
          <footer className="w-full py-8 px-6 md:px-8 border-t border-app bg-white theme-transition">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className="mb-6 md:mb-0">
                  <span className="font-bold text-xl">
                    <span className="ai-vertise-gradient-text">AI-Vertise</span>
                  </span>
                  <p className="mt-2 text-sm text-gray-500 max-w-md">
                    The most advanced AI-powered brief management platform, designed for the digital marketers of 2025.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <p className="text-sm text-gray-500 text-center">
                  &copy; {new Date().getFullYear()} AI-Vertise. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </ClientProviders>
      </body>
    </html>
  );
}
