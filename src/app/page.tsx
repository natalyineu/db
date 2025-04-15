"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [hoverEffect, setHoverEffect] = useState(false);
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="relative w-full max-w-5xl">
        {/* Decorative elements */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-purple-200 dark:bg-purple-900/30 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-pink-200 dark:bg-pink-900/30 rounded-full filter blur-3xl opacity-30"></div>
        
        <div className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="grid md:grid-cols-2 gap-0">
            {/* Content Column */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                Powered by AI-Vertise 2025
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                AI-Powered <span className="ai-vertise-gradient-text">Campaign</span> Management
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Streamline your advertising with predictive AI analytics. Create smarter campaigns and boost your ROI by up to 300%.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/register" 
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition-all bg-indigo-600 rounded-xl text-white hover:bg-indigo-700"
                  onMouseEnter={() => setHoverEffect(true)}
                  onMouseLeave={() => setHoverEffect(false)}
                >
                  <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Create Account
                  </span>
                </Link>
                
                <Link 
                  href="/login" 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 16L7 12M7 12L11 8M7 12H21M16 16V17C16 18.6569 14.6569 20 13 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H13C14.6569 4 16 5.34315 16 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign In
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-${200 + i*100} dark:bg-gray-${600 - i*100}`}></div>
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Join 2,500+ marketers today
                </span>
              </div>
            </div>
            
            {/* Image/Visual Column */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-900/20 dark:to-purple-900/20"></div>
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 transform transition-transform hover:scale-105 duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Campaign Performance</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">247% ROI</div>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Mock chart */}
                    <div className="h-32 bg-gradient-to-b from-transparent to-indigo-50 dark:to-indigo-900/20 rounded-lg flex items-end">
                      {[...Array(12)].map((_, i) => {
                        const height = 20 + Math.random() * 80;
                        return (
                          <div 
                            key={i} 
                            className="flex-1 mx-[1px] bg-indigo-500 dark:bg-indigo-400 rounded-t-sm" 
                            style={{ height: `${height}%` }}
                          ></div>
                        );
                      })}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {['Clicks', 'Impressions', 'Conversions'].map((label, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {label === 'Clicks' ? '12.4K' : label === 'Impressions' ? '324K' : '843'}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        AI Optimization Active
                      </div>
                      <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded text-xs font-medium text-indigo-700 dark:text-indigo-300">
                        Optimizing
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            {
              title: 'AI-Powered Insights',
              description: 'Leverage machine learning for predictive campaign analysis',
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12H4M12 3V4M20 12H21M12 20V21M18.364 5.63604L17.6569 6.34315M5.63604 5.63604L6.34315 6.34315M6.34315 17.6569L5.63604 18.364M17.6569 17.6569L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            },
            {
              title: 'Smart Budget Allocation',
              description: 'Automatically distribute budget to best-performing channels',
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6C14 7.10457 13.1046 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 20C10.8954 20 10 19.1046 10 18C10 16.8954 10.8954 16 12 16C13.1046 16 14 16.8954 14 18C14 19.1046 13.1046 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 14C19.1046 14 20 13.1046 20 12C20 10.8954 19.1046 10 18 10C16.8954 10 16 10.8954 16 12C16 13.1046 16.8954 14 18 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 14C7.10457 14 8 13.1046 8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.5355 6.46448L16.9497 7.87869M7.05026 16.1213L8.46447 17.5355M7.05026 7.87869L8.46447 6.46448M15.5355 17.5355L16.9497 16.1213" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            },
            {
              title: 'Real-time Analytics',
              description: 'Monitor performance metrics with real-time data visualization',
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8V16M12 11V16M8 14V16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
