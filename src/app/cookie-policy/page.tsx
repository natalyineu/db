'use client';

import { CleanBackground } from '@/components/ui';
import Link from 'next/link';

export default function CookiePolicyPage() {
  return (
    <CleanBackground>
      <div className="container mx-auto p-6 theme-transition">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
            <Link href="/data" className="text-indigo-600 hover:text-indigo-800">
              Back to Dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-600 mb-2">
                This Cookie Policy explains how AI-Vertise ("we", "us", or "our") uses cookies and similar technologies on our website and platform. By using our services, you consent to the use of cookies in accordance with this Cookie Policy.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. What Are Cookies?</h2>
              <p className="text-gray-600 mb-2">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
              <p className="text-gray-600">
                Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device when you go offline, while session cookies are deleted as soon as you close your web browser.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. How We Use Cookies</h2>
              <p className="text-gray-600 mb-3">
                We use cookies for various purposes, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, account management, and network management.</li>
                <li><strong>Functional Cookies:</strong> These cookies enable us to personalize your experience on our website, remember your preferences, and provide enhanced features.</li>
                <li><strong>Analytics Cookies:</strong> These cookies collect information about how you use our website, which pages you visit, and any errors you might encounter. This helps us improve our website and your experience.</li>
                <li><strong>Marketing Cookies:</strong> These cookies track your online activity to help advertisers deliver more relevant advertising or to limit the number of times you see an advertisement.</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Third-Party Cookies</h2>
              <p className="text-gray-600 mb-2">
                We may also use third-party cookies from services like Google Analytics, Facebook, and other advertising partners. These third parties may use cookies, web beacons, and similar technologies to collect or receive information from our website and elsewhere on the internet and use that information to provide measurement services and target ads.
              </p>
              <p className="text-gray-600">
                Please note that these third parties may provide you with ways to choose not to have your information collected or used for targeted advertising.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Cookie Consent</h2>
              <p className="text-gray-600">
                When you first visit our website, you will be shown a cookie banner that allows you to choose which categories of cookies you accept. You can change your preferences at any time through our Cookie Preferences tool accessible from our website footer.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">6. Managing Cookies</h2>
              <p className="text-gray-600 mb-3">
                Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, or to alert you when cookies are being sent. The methods for doing so vary from browser to browser, but they can usually be found in the settings or preferences menu.
              </p>
              <p className="text-gray-600">
                Please note that blocking or deleting cookies may impact your experience on our website, as some features may not function properly.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">7. Changes to This Cookie Policy</h2>
              <p className="text-gray-600">
                We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will become effective when we post the revised Cookie Policy on our website. We encourage you to periodically review this page for the latest information on our cookie practices.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
              <p className="text-gray-600 mb-2">
                If you have questions or concerns about this Cookie Policy or our use of cookies, please contact us at:
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> privacy@ai-vertise.com
              </p>
            </section>
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