'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Sample login validation
    if (username === 'admin' && password === 'password') {
      // Set a simple auth token in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <form className="mt-8 space-y-6 text-right" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 text-sm text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900 rounded-md">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          اسم المستخدم
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
        />
      </div>
      
      <div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 border border-transparent rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500"
        >
          تسجيل الدخول
        </button>
      </div>
      
      <div className="text-sm text-center text-gray-500 dark:text-gray-400">
        {/* <p>Sample credentials: admin / password</p> */}
      </div>
    </form>
  );
}