'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  HomeIcon, 
  FolderIcon, 
  TagIcon,
  UsersIcon,
  UserIcon,
  CogIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  ShareIcon,
  DocumentIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

const workflowItems = [
  { name: 'الأخبار', href: '/dashboard/workflow/articles' },
  { name: 'الفيديوهات', href: '/dashboard/workflow/videos' },
  { name: 'البودكاست', href: '/dashboard/workflow/podcasts' },
  { name: 'مقالات الرأي', href: '/dashboard/workflow/opinions' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [workflowOpen, setWorkflowOpen] = useState(
    pathname?.startsWith('/dashboard/workflow') ?? false
  );
  
  const topNav = [
    { name: 'الرئيسية', href: '/dashboard', icon: HomeIcon },
  ];

  const navigation = [
    { name: 'الأقسام', href: '/dashboard/categories', icon: FolderIcon },
    { name: 'وسوم', href: '/dashboard/tags', icon: TagIcon },
    { name: 'الأخبار في الأعلى', href: '/dashboard/upper-articles', icon: ChevronUpIcon },
    { name: 'الأخبار العاجلة', href: '/dashboard/breaking-news', icon: ExclamationTriangleIcon },
    { name: 'كتّاب الرأي', href: '/dashboard/authors', icon: UserIcon },
    { name: 'وسائل التواصل الاجتماعي', href: '/dashboard/social-media', icon: ShareIcon },
    { name: 'شروط الاستخدام', href: '/dashboard/terms-of-use', icon: DocumentIcon },
    { name: 'سياسة الخصوصية', href: '/dashboard/privacy-policy', icon: ShieldCheckIcon },
    { name: 'عن الأوروبية', href: '/dashboard/about-us', icon: InformationCircleIcon },
    { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-white text-xl font-semibold">لوحة التحكم</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {/* الرئيسية */}
          {topNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md text-right`}
              >
                <div className="flex items-center justify-between w-full">
                  <item.icon
                    className={`${
                      isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                    } flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}

          {/* ── Workflow dropdown ── */}
          <div>
            <button
              onClick={() => setWorkflowOpen(!workflowOpen)}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-right ${
                workflowOpen || pathname?.startsWith('/dashboard/workflow')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <ChevronDownIcon
                  className={`flex-shrink-0 h-4 w-4 transition-transform ${workflowOpen ? 'rotate-180' : ''} text-gray-400`}
                />
                <div className="flex items-center gap-2">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-300" />
                  <span>سير العمل</span>
                </div>
              </div>
            </button>

            {workflowOpen && (
              <div className="mt-1 space-y-1 pr-4 border-r border-gray-700 mr-4">
                {workflowItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-3 py-2 text-sm rounded-md text-right ${
                        isActive
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* remaining nav */}
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md text-right`}
              >
                <div className="flex items-center justify-between w-full">
                  <item.icon
                    className={`${
                      isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                    } flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}