'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm z-10 sticky top-0">
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Right side in RTL */}
          <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
            <div className="flex-shrink-0 flex items-center md:hidden">
              <button
                type="button"
                onClick={onMenuToggle}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">فتح القائمة الجانبية</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="hidden md:mr-6 md:flex md:space-x-4 md:space-x-reverse">
              {/* Desktop navigation links can go here if needed */}
            </div>
          </div>

          {/* Left side in RTL */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {/* Notification button */}
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <span className="sr-only">عرض الإشعارات</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((current) => !current)}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-haspopup="menu"
              >
                  <span className="sr-only">فتح قائمة المستخدم</span>
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                    A
                  </div>
              </button>
              <div
                className={`origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 transition duration-100 ${
                  isProfileMenuOpen
                    ? 'pointer-events-auto scale-100 opacity-100'
                    : 'pointer-events-none scale-95 opacity-0'
                }`}
                role="menu"
              >
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 text-right hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  الملف الشخصي
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 text-right hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  الإعدادات
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}