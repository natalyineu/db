import Link from 'next/link';
import { NextPage } from 'next';

const Custom404: NextPage = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">404 - Page Not Found</h1>
          <p className="mt-2 text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
        </div>
        
        <div className="mt-8">
          <Link 
            href="/"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Custom404; 