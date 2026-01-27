'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getTermsOfUseById, updateTermsOfUse } from '../../lib/api';
import RichTextEditor from "../../../../../components/RichTextEditor";
import { TermsOfUse } from '../../types/TermsOfUse';


export default function EditTermsOfUse() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [formData, setFormData] = useState<TermsOfUse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTermsOfUse = async () => {
      try {
        const data = await getTermsOfUseById(parseInt(id));
        setFormData(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'فشل في تحميل البيانات';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadTermsOfUse();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => prev ? { ...prev, content } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      if (!formData.title.trim()) {
        throw new Error('العنوان مطلوب');
      }
      if (!formData.content.trim()) {
        throw new Error('المحتوى مطلوب');
      }

      await updateTermsOfUse(formData.id, {
        title: formData.title,
        content: formData.content
      });
      toast.success('تم تحديث شروط الاستخدام بنجاح');
      router.push('/dashboard/terms-of-use');
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل في تحديث شروط الاستخدام';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-600">لم يتم العثور على البيانات</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">تعديل شروط الاستخدام</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          رجوع
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-right">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 text-right">
              العنوان
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
              placeholder="أدخل عنوان شروط الاستخدام"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 text-right">
              المحتوى
            </label>
            <RichTextEditor
              value={formData.content || ''}
              onChange={handleContentChange}
              placeholder="أدخل محتوى شروط الاستخدام"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
