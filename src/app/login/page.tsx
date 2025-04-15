import { Suspense } from 'react';
import LoginForm from './login-form';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 