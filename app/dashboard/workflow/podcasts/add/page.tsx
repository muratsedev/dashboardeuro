'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPodcast } from '@/app/dashboard/podcasts/lib/api';
import { CreatePodcastDto } from '@/app/dashboard/podcasts/types/Podcast';
import toast from 'react-hot-toast';

export default function AddPodcastPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreatePodcastDto>({
    podcastTitle: '',
    podcastSummary: '',
    podcastLink: '',
    isPublished: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.podcastTitle.trim() || !form.podcastLink.trim()) {
      toast.error('العنوان والرابط مطلوبان');
      return;
    }
    setSaving(true);
    try {
      await createPodcast(form);
      toast.success('تم إنشاء البودكاست بنجاح');
      router.push('/dashboard/workflow/podcasts');
    } catch {
      toast.error('فشل إنشاء البودكاست');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إضافة بودكاست جديد</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          ← رجوع
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان *</label>
          <input
            type="text"
            value={form.podcastTitle}
            onChange={(e) => setForm({ ...form, podcastTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط البودكاست *</label>
          <input
            type="url"
            value={form.podcastLink}
            onChange={(e) => setForm({ ...form, podcastLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            placeholder="https://..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الملخص</label>
          <textarea
            value={form.podcastSummary ?? ''}
            onChange={(e) => setForm({ ...form, podcastSummary: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublished"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="h-4 w-4"
          />
          <label htmlFor="isPublished" className="text-sm text-gray-700 dark:text-gray-300">منشور</label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-60"
          >
            {saving ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
        </div>
      </form>
    </div>
  );
}
