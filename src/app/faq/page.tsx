'use client';

import { CleanBackground } from '@/components/ui';
import Link from 'next/link';

export default function FAQPage() {
  return (
    <CleanBackground>
      <div className="container mx-auto p-6 theme-transition">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
            <Link href="/data" className="text-indigo-600 hover:text-indigo-800">
              Back to Dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">About AI-Vertise</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">What is AI-Vertise?</h3>
                <p className="text-gray-600">
                  AI-Vertise is a platform that uses artificial intelligence to optimize and automate digital advertising campaigns. Our technology helps businesses of all sizes create more effective advertising with less effort and resources.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">How does AI-Vertise work?</h3>
                <p className="text-gray-600">
                  After you provide us with your campaign goals and target audience, our AI system analyzes vast amounts of data to create optimized ad creatives and targeting strategies. We then deploy your campaigns across multiple platforms, continuously monitor performance, and make real-time adjustments to maximize your results.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">What platforms do you support?</h3>
                <p className="text-gray-600">
                  We currently support major advertising platforms including Google Ads, Facebook, Instagram, Twitter, LinkedIn, and programmatic advertising networks. We're constantly expanding our platform support.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Pricing and Plans</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">How much does AI-Vertise cost?</h3>
                <p className="text-gray-600">
                  We offer several plans starting from our Starter plan. Each plan includes a certain number of impressions and features. You can view our current pricing on the dashboard or contact our sales team for custom plans.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">What happens if I exceed my plan's impression limit?</h3>
                <p className="text-gray-600">
                  If you approach your plan's impression limit, we'll notify you so you can either upgrade to a higher tier or purchase additional impressions. We never charge you automatically for overages without your consent.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-gray-600">
                  Yes, you can upgrade your plan at any time. Downgrades typically take effect at the start of your next billing cycle. Please contact our support team if you need to make changes to your subscription.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Management</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">How do I create a new campaign?</h3>
                <p className="text-gray-600">
                  To create a new campaign, log in to your dashboard and complete the brief form with your campaign goals, target audience, and other requirements. Our system will then use this information to create and optimize your campaign.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Can I edit my campaign after it's started?</h3>
                <p className="text-gray-600">
                  Yes, you can make certain changes to active campaigns. You can adjust budgets, targeting parameters, and campaign duration. For major changes, we recommend creating a new campaign for optimal results.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">How do I track my campaign performance?</h3>
                <p className="text-gray-600">
                  Your dashboard provides real-time performance metrics including impressions, clicks, reach, and other KPIs. You can also generate detailed reports for specific time periods and export them for your records.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Support</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">How can I get help if I have questions?</h3>
                <p className="text-gray-600">
                  We offer support via email, chat, and scheduled calls for higher-tier plans. You can reach our support team through the contact form on our website or by emailing support@ai-vertise.com.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">What is your response time for support requests?</h3>
                <p className="text-gray-600">
                  We typically respond to support requests within 24 hours during business days. Premium plan customers receive priority support with faster response times.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-gray-200">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500">© {new Date().getFullYear()} AI-Vertise. All rights reserved.</p>
              </div>
              <div className="flex space-x-6">
                <a href="/faq" className="text-sm text-gray-500 hover:text-indigo-600">FAQ</a>
                <a href="/privacy-policy" className="text-sm text-gray-500 hover:text-indigo-600">Privacy Policy</a>
                <a href="/terms-of-service" className="text-sm text-gray-500 hover:text-indigo-600">Terms of Service</a>
                <a href="/cookie-policy" className="text-sm text-gray-500 hover:text-indigo-600">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </CleanBackground>
  );
} 