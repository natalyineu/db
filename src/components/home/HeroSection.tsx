"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function HeroSection() {
  const [hoverEffect, setHoverEffect] = useState(false);
  
  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="grid md:grid-cols-5 gap-0">
        {/* Content Column - Wider than before */}
        <div className="md:col-span-3 p-8 md:p-16 flex flex-col justify-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
            AI-Powered Advertising
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-3">
            <span className="block mb-1">You brief.</span>
            <span className="block mb-1">We run.</span>
            <span className="ai-vertise-gradient-text">We handle the rest.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl">
            AI-Vertise is a fully-managed, AI-powered ad platform. Tell us your goals — we create your assets, launch your campaign, and deliver reports with smart recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link 
              href="/register" 
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium transition-all bg-indigo-600 rounded-xl text-white hover:bg-indigo-700"
              onMouseEnter={() => setHoverEffect(true)}
              onMouseLeave={() => setHoverEffect(false)}
            >
              <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
              <span className="relative flex items-center text-base">
                Get Started
                <svg className="ml-2 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
            
            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-gray-200 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              Sign In
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full ring-2 ring-white" style={{backgroundColor: `rgb(${220 - i*20}, ${220 - i*20}, ${240 - i*15})`}}></div>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              <span className="font-semibold">3,500+</span> businesses trust AI-Vertise
            </span>
          </div>
        </div>
        
        {/* Visual Column */}
        <div className="md:col-span-2 relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 to-purple-50/90"></div>
          <div className="relative h-full flex items-center justify-center p-8">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-gray-100 rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl">
              {/* Campaign dashboard preview */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs font-medium text-gray-500">Your Campaign</div>
                  <div className="text-xl font-bold text-gray-900">Summer Collection</div>
                </div>
                <div className="flex items-center px-2 py-1 bg-green-50 rounded-full text-green-700 text-xs font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                  Live
                </div>
              </div>
              
              {/* Progress steps */}
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-200 rounded-full"></div>
                <div className="absolute top-1/2 left-0 w-3/4 h-1 -translate-y-1/2 bg-indigo-500 rounded-full"></div>
                
                <div className="relative flex justify-between">
                  {['Brief', 'Creation', 'Launch', 'Report'].map((step, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i < 3 ? 'bg-indigo-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                        {i < 3 ? (
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.5 6L5.5 8L8.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : i + 1}
                      </div>
                      <div className={`mt-2 text-xs font-medium ${i < 3 ? 'text-indigo-700' : 'text-gray-500'}`}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Performance metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Impressions', value: '324,842', change: '+24%' },
                    { label: 'Clicks', value: '12,493', change: '+18%' }
                  ].map((metric, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="text-xs font-medium text-gray-500">{metric.label}</div>
                        <div className="text-xs text-green-600 font-medium">{metric.change}</div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                    </div>
                  ))}
                </div>
                
                {/* Simplified chart */}
                <div className="h-24 bg-gradient-to-b from-white to-indigo-50 rounded-lg flex items-end p-1">
                  {[35, 45, 40, 50, 65, 75, 70, 85, 80, 95, 90, 100].map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 mx-[1px] rounded-t-sm transition-all duration-300 hover:opacity-80" 
                      style={{ 
                        height: `${height}%`, 
                        backgroundColor: height > 70 ? '#6366f1' : height > 50 ? '#a5b4fc' : '#c7d2fe' 
                      }}
                    ></div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center px-2 py-2 bg-indigo-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-xs font-medium text-indigo-700">AI Optimization Active</div>
                  </div>
                  <div className="px-2 py-1 bg-indigo-100 rounded text-xs font-medium text-indigo-700">
                    Auto
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 