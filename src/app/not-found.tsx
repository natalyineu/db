import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mt-2 text-gray-600">The requested page could not be found.</p>
        </div>
        
        <div className="mt-8">
          <Link 
            href="/"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ai-vertise-gradient-bg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
} 