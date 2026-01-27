//import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Login</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
