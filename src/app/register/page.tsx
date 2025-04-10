import { Suspense } from 'react';
import RegisterForm from './register-form';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
} 