'use client';

import { useState } from 'react';
import { getApiEndpoint } from '@/lib/api-config';
import { getToken, hasRole, Roles } from '@/lib/auth';
import { WorkflowStatus, WorkflowBadge } from './WorkflowBadge';
import toast from 'react-hot-toast';

interface WorkflowActionsProps {
  contentType: 'articles' | 'videos' | 'podcasts' | 'opinions';
  id: string | number;
  currentStatus: WorkflowStatus;
  onStatusChange: (newStatus: WorkflowStatus) => void;
}

export default function WorkflowActions({ contentType, id, currentStatus, onStatusChange }: WorkflowActionsProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const callAction = async (action: 'submit' | 'approve' | 'reject' | 'publish' | 'unpublish') => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(getApiEndpoint(`/api/Workflow/${contentType}/${id}/${action}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note: note || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.message ?? 'حدث خطأ');
        return;
      }

      const data = await res.json();
      toast.success(data.message);
      onStatusChange(data.status as WorkflowStatus);
      setNote('');
    } catch {
      toast.error('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const isEditor = hasRole(Roles.Editor, Roles.Admin);
  const isProofReader = hasRole(Roles.ProofReader, Roles.Admin);
  const isPublisher = hasRole(Roles.Publisher, Roles.Admin);

  return (
    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-800" dir="rtl">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">حالة المحتوى:</span>
        <WorkflowBadge status={currentStatus} />
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="ملاحظة (اختياري)..."
        rows={2}
        className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white mb-3 resize-none"
      />

      <div className="flex flex-wrap gap-2">
        {/* Submit for review — Editor */}
        {isEditor && (currentStatus === 0 || currentStatus === 3) && (
          <button
            onClick={() => callAction('submit')}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded disabled:opacity-60"
          >
            إرسال للمراجعة
          </button>
        )}

        {/* Approve — ProofReader */}
        {isProofReader && currentStatus === 1 && (
          <button
            onClick={() => callAction('approve')}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-60"
          >
            موافقة
          </button>
        )}

        {/* Reject — ProofReader / Publisher */}
        {(isProofReader || isPublisher) && currentStatus !== 4 && currentStatus !== 0 && (
          <button
            onClick={() => callAction('reject')}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-60"
          >
            رفض
          </button>
        )}

        {/* Publish — Publisher */}
        {isPublisher && currentStatus === 2 && (
          <button
            onClick={() => callAction('publish')}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-60"
          >
            نشر
          </button>
        )}

        {/* Unpublish — Publisher / Admin */}
        {isPublisher && currentStatus === 4 && contentType === 'articles' && (
          <button
            onClick={() => callAction('unpublish')}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-60"
          >
            إلغاء النشر
          </button>
        )}
      </div>
    </div>
  );
}
