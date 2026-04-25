'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

  const filteredItems = statusFilter !== null
    ? items.filter((i) => i.workflowStatus === statusFilter)
    : items;

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

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <WorkflowBadge status={item.workflowStatus} />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.updatedAt && (
                  <span className="hidden sm:inline text-xs text-gray-400">
                    {new Date(item.updatedAt).toLocaleDateString('ar-SA')}
                  </span>
                )}
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
            </div>

            {expandedId === item.id && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 pb-4">
                {item.workflowNote && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-1">
                    ملاحظة: {item.workflowNote}
                  </p>
                )}
                <WorkflowActions
                  contentType={contentType}
                  id={item.type === 'articles' || item.type === 'opinions' ? item.id : Number(item.id)}
                  currentStatus={item.workflowStatus}
                  onStatusChange={(s) => handleStatusChange(item.id, s)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
