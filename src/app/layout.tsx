import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./providers";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI-Vertise - AI-Powered Campaign Management",
  description: "The most advanced AI campaign management platform for 2025",
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
      </head>
      <body className="min-h-screen theme-transition dark:bg-gray-900 bg-gray-50 flex flex-col">
        <ClientProviders>
          <header className="w-full py-4 px-6 md:px-8 flex items-center justify-between border-b border-app theme-transition backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 sticky top-0 z-50">
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
                  { label: 'Campaigns', href: '/data' },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
              <ThemeToggle />
              
              <Link 
                href="/login"
                className="hidden md:inline-flex text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
              >
                Sign in
              </Link>
              
              <Link 
                href="/register"
                className="text-sm px-3 md:px-4 py-2 rounded-full ai-vertise-gradient-bg text-white hover:opacity-90 transition-opacity inline-flex items-center"
              >
                <span className="hidden md:inline">Get Started</span>
                <span className="md:hidden">Sign Up</span>
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              
              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </header>
          
          <main className="flex-grow">
            {children}
          </main>
          
          <footer className="w-full py-8 px-6 md:px-8 border-t border-app bg-white dark:bg-gray-900 theme-transition">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className="mb-6 md:mb-0">
                  <span className="font-bold text-xl">
                    <span className="ai-vertise-gradient-text">AI-Vertise</span>
                  </span>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    The most advanced AI-powered campaign management platform, designed for the digital marketers of 2025.
                  </p>
                </div>
                
                {/* Social media links removed until implemented */}
                <div className="hidden">
                  {['Twitter', 'LinkedIn', 'GitHub', 'Instagram'].map((social, i) => (
                    <a key={i} href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                      <span className="sr-only">{social}</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Footer links removed until implemented */}
              <div className="hidden">
                {[
                  {
                    title: 'Product',
                    links: ['Features', 'Pricing', 'Integrations', 'Roadmap']
                  },
                  {
                    title: 'Resources',
                    links: ['Documentation', 'Guides', 'API Status', 'Changelog']
                  },
                  {
                    title: 'Company',
                    links: ['About', 'Blog', 'Careers', 'Press']
                  },
                  {
                    title: 'Legal',
                    links: ['Privacy', 'Terms', 'Security', 'Cookies']
                  }
                ].map((group, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{group.title}</h3>
                    <ul className="mt-4 space-y-2">
                      {group.links.map((link, j) => (
                        <li key={j}>
                          <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
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
