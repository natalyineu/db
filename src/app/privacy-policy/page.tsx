'use client';

import { CleanBackground } from '@/components/ui';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <CleanBackground>
      <div className="container mx-auto p-6 theme-transition">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <Link href="/data" className="text-indigo-600 hover:text-indigo-800">
              Back to Dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-600 mb-2">
                AI-Vertise ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital advertising platform and related services.
              </p>
              <p className="text-gray-600">
                Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium mb-2">Personal Information</h3>
              <p className="text-gray-600 mb-3">
                We may collect personal information that you provide to us, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Contact information (such as name, email address, phone number)</li>
                <li>Account credentials</li>
                <li>Billing information and transaction details</li>
                <li>Company information</li>
                <li>Marketing preferences</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-2">Usage Data</h3>
              <p className="text-gray-600 mb-3">
                We automatically collect certain information when you access or use our services:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>IP address and device information</li>
                <li>Browser type and settings</li>
                <li>Operating system</li>
                <li>Log data and usage patterns</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              
              <p className="text-gray-600 mb-3">
                We may use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Providing, operating, and maintaining our services</li>
                <li>Improving and personalizing your experience</li>
                <li>Processing transactions and sending related information</li>
                <li>Responding to comments, questions, and requests</li>
                <li>Sending administrative information</li>
                <li>Marketing and promotional purposes (with your consent)</li>
                <li>Protecting our rights and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Disclosure of Your Information</h2>
              
              <p className="text-gray-600 mb-3">
                We may share your information with third parties in certain situations:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>With service providers who perform services on our behalf</li>
                <li>With advertising platforms when you use our services</li>
                <li>For business transfers (such as merger or acquisition)</li>
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect rights, privacy, safety, or property</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Your Privacy Rights</h2>
              
              <p className="text-gray-600 mb-3">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Right to access</li>
                <li>Right to rectification</li>
                <li>Right to erasure</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object</li>
              </ul>
              <p className="text-gray-600 mt-3">
                To exercise your rights, please contact us using the information provided in the "Contact Us" section.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
              
              <p className="text-gray-600">
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">7. Changes to This Privacy Policy</h2>
              
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
              
              <p className="text-gray-600">
                If you have questions or concerns about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-600 mt-2">
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