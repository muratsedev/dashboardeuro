'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createPrivacyPolicy } from '../lib/api';
import RichTextEditor from '../../../../components/RichTextEditor';

export default function AddPrivacyPolicy() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      if (!formData.title.trim()) {
        throw new Error('العنوان مطلوب');
      }
      if (!formData.content.trim()) {
        throw new Error('المحتوى مطلوب');
      }

      await createPrivacyPolicy(formData);
      toast.success('تم إنشاء سياسة الخصوصية بنجاح');
      router.push('/dashboard/privacy-policy');
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل في إنشاء سياسة الخصوصية';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">إضافة سياسة خصوصية جديدة</h1>
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
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
              placeholder="أدخل عنوان سياسة الخصوصية"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 text-right">
              المحتوى
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="أدخل محتوى سياسة الخصوصية"
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
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
