'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getApiEndpoint } from '@/lib/api-config';
import { getToken } from '@/lib/auth';
import { WorkflowBadge, WorkflowStatus } from './WorkflowBadge';
import WorkflowActions from './WorkflowActions';
import toast from 'react-hot-toast';

export type ContentType = 'articles' | 'videos' | 'podcasts' | 'opinions';

interface QueueItem {
  type: ContentType;
  id: string;
  title: string;
  workflowStatus: WorkflowStatus;
  workflowNote?: string;
  updatedAt?: string;
  createdAt?: string;
  categoryName?: string;
  editorChoice?: boolean;
}

const STATUS_FILTERS: { label: string; value: number | null }[] = [
  { label: 'الكل', value: null },
  { label: 'مسودة', value: 0 },
  { label: 'قيد المراجعة', value: 1 },
  { label: 'موافق عليه', value: 2 },
  { label: 'مرفوض', value: 3 },
  { label: 'منشور', value: 4 },
];

const TYPE_LABELS: Record<ContentType, string> = {
  articles: 'الأخبار',
  videos: 'الفيديوهات',
  podcasts: 'البودكاست',
  opinions: 'مقالات الرأي',
};

const ADD_LINKS: Record<ContentType, string> = {
  articles: '/dashboard/articles/add',
  videos:   '/dashboard/workflow/videos/add',
  podcasts: '/dashboard/workflow/podcasts/add',
  opinions: '/dashboard/opinions/add',
};

const EDIT_LINKS: Record<ContentType, (id: string) => string> = {
  articles: (id) => `/dashboard/articles/edit/${id}`,
  videos:   (id) => `/dashboard/workflow/videos/edit/${id}`,
  podcasts: (id) => `/dashboard/workflow/podcasts/edit/${id}`,
  opinions: (id) => `/dashboard/opinions/edit/${id}`,
};

const DELETE_API: Record<ContentType, (id: string) => string> = {
  articles: (id) => `/api/Articles/${id}`,
  videos:   (id) => `/api/Videos/${id}`,
  podcasts: (id) => `/api/Podcasts/${id}`,
  opinions: (id) => `/api/Opinions/${id}`,
};

interface WorkflowQueueProps {
  contentType: ContentType;
}

export default function WorkflowQueue({ contentType }: WorkflowQueueProps) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const loadingRef = useRef(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const token = getToken();
      const qs = statusFilter !== null ? `?status=${statusFilter}` : '';
      const res = await fetch(getApiEndpoint(`/api/Workflow/queue${qs}`), {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (signal?.aborted) return;
      if (res.status === 401) { router.push('/'); return; }
      if (!res.ok) throw new Error('فشل تحميل القائمة');
      const data: QueueItem[] = await res.json();
      if (!signal?.aborted) setItems(data.filter((d) => d.type === contentType));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      toast.error('تعذر تحميل البيانات', { id: `wf-queue-${contentType}` });
    } finally {
      loadingRef.current = false;
      if (!signal?.aborted) setLoading(false);
    }
  }, [contentType, statusFilter, router]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => { controller.abort(); loadingRef.current = false; };
  }, [load]);

  const handleDelete = async (item: QueueItem) => {
    if (!confirm(`هل أنت متأكد من حذف "${item.title}"؟`)) return;
    setDeletingId(item.id);
    try {
      const token = getToken();
      const res = await fetch(getApiEndpoint(DELETE_API[contentType](item.id)), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('تم الحذف بنجاح');
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      toast.error('فشل الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: WorkflowStatus) => {
    setItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, workflowStatus: newStatus } : item)
    );
  };

  const filteredItems = items
    .filter((i) => statusFilter === null || i.workflowStatus === statusFilter)
    .filter((i) => !searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div dir="rtl" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          سير العمل — {TYPE_LABELS[contentType]}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded"
          >
            تحديث
          </button>
          <Link
            href={ADD_LINKS[contentType]}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة جديد
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="بحث بالعنوان..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
        {STATUS_FILTERS.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {loading ? 'جارٍ التحميل...' : `${filteredItems.length} عنصر`}
      </p>

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">لا توجد عناصر</div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  العنوان ↓
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  التصنيف
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الحالة
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  اختيار المحرر
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  تاريخ الإنشاء ↓
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map((item) => (
                <Fragment key={item.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white max-w-xs">
                      <span className="line-clamp-2">{item.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {item.categoryName || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <WorkflowBadge status={item.workflowStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                      {item.editorChoice ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                          ✓ نعم
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-SA') : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={EDIT_LINKS[contentType](item.id)}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded"
                        >
                          {expandedId === item.id ? 'إخفاء' : 'الإجراءات'}
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-40"
                          title="حذف"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === item.id && (
                    <tr className="bg-gray-50 dark:bg-gray-700/30">
                      <td colSpan={6} className="px-4 pb-4 pt-2">
                        {item.workflowNote && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            ملاحظة: {item.workflowNote}
                          </p>
                        )}
                        <WorkflowActions
                          contentType={contentType}
                          id={item.type === 'articles' || item.type === 'opinions' ? item.id : Number(item.id)}
                          currentStatus={item.workflowStatus}
                          onStatusChange={(s) => handleStatusChange(item.id, s)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
