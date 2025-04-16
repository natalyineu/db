'use client';

import { CleanBackground } from '@/components/ui';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <CleanBackground>
      <div className="container mx-auto p-6 theme-transition">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <Link href="/data" className="text-indigo-600 hover:text-indigo-800">
              Back to Dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-600 mb-2">
                Welcome to AI-Vertise. By accessing our website, platform, or services, you agree to be bound by these Terms of Service ("Terms").
              </p>
              <p className="text-gray-600">
                Please read these Terms carefully before using our services. If you do not agree to these Terms, you may not access or use our services.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Definitions</h2>
              <ul className="list-disc pl-6 text-gray-600">
                <li><strong>"Services"</strong> refers to the AI-Vertise platform, website, and related services.</li>
                <li><strong>"User"</strong>, <strong>"you"</strong>, or <strong>"your"</strong> refers to individuals or entities using our Services.</li>
                <li><strong>"We"</strong>, <strong>"us"</strong>, or <strong>"our"</strong> refers to AI-Vertise.</li>
                <li><strong>"Content"</strong> refers to any information, data, text, images, videos, or other materials submitted, posted, or displayed through our Services.</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
              <p className="text-gray-600 mb-3">
                To access certain features of our Services, you may be required to register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account and password</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Service Usage</h2>
              <p className="text-gray-600 mb-3">
                When using our Services, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Not use our Services for any illegal or unauthorized purpose</li>
                <li>Not attempt to gain unauthorized access to any portion of our Services</li>
                <li>Not interfere with or disrupt the integrity or performance of our Services</li>
                <li>Not engage in any activity that could harm, disable, overburden, or impair our Services</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Content and Submissions</h2>
              <p className="text-gray-600 mb-3">
                You retain ownership of any Content you submit through our Services. However, by submitting Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such Content for the purpose of providing and improving our Services.
              </p>
              <p className="text-gray-600">
                You represent and warrant that you have all necessary rights to submit Content and that such Content does not violate any intellectual property rights or other rights of third parties.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">6. Subscription and Payments</h2>
              <p className="text-gray-600 mb-3">
                Certain features of our Services may require a subscription or payment. By subscribing to our Services:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>You agree to pay all fees associated with your subscription plan</li>
                <li>You authorize us to charge your designated payment method</li>
                <li>Fees may change with notice provided at least 30 days in advance</li>
                <li>Subscriptions automatically renew unless cancelled prior to the renewal date</li>
                <li>Refunds are provided in accordance with our refund policy</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">7. Termination</h2>
              <p className="text-gray-600">
                We reserve the right to suspend or terminate your access to our Services at any time for any reason, including but not limited to violation of these Terms. Upon termination, your right to use our Services will immediately cease.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">8. Disclaimer of Warranties</h2>
              <p className="text-gray-600">
                Our Services are provided "as is" and "as available" without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
              <p className="text-gray-600">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use our Services.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-gray-600">
                We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on this page. Your continued use of our Services after such changes constitutes your acceptance of the new Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
              <p className="text-gray-600">
                If you have questions or concerns about these Terms, please contact us at:
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Email:</strong> legal@ai-vertise.com
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