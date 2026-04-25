'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Author } from './types/Author';
import { getAuthors, deleteAuthor } from './lib/api';
import AuthorTable from '../../../components/AuthorTable';

export default function AuthorsPage() {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const data = await getAuthors();
      setAuthors(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل الكتّاب');
      toast.error('فشل في تحميل الكتّاب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكاتب؟')) return;

    try {
      await deleteAuthor(id);
      await loadAuthors();
      toast.success('تم حذف الكاتب بنجاح');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل في حذف الكاتب';
      setError(msg);
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">الكتّاب</h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة بيانات الكتّاب والصور الشخصية</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {authors.length} العناصر
          </span>
          <button
            onClick={loadAuthors}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-600"
          >
            <ArrowPathIcon className="h-4 w-4" />
            تحديث
          </button>
          <button
            onClick={() => router.push('/dashboard/authors/add')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة كاتب
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-right">
          {error}
        </div>
      )}

      <AuthorTable
        authors={authors}
        onEdit={(id) => router.push(`/dashboard/authors/edit/${id}`)}
        onDelete={handleDelete}
      />

      <Toaster />
    </div>
  );
}
