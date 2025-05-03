"use client";

import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-200 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-pink-200 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute top-32 right-24 w-20 h-20 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>
        
        <HeroSection />
        <HowItWorksSection />
        <BenefitsSection />
        <CTASection />
      </div>
    </main>
  );
}
