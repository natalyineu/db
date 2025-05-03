import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white mb-6">
      <h2 className="text-3xl font-bold mb-4">Ready to transform your advertising?</h2>
      <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">Join thousands of businesses who trust AI-Vertise with their advertising needs.</p>
      <Link 
        href="/register" 
        className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 transition-colors shadow-md"
      >
        Get Started Free
        <svg className="ml-2 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
} 