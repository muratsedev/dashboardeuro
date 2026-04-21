'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { PrivacyPolicy } from './types/PrivacyPolicy';
import { getPrivacyPoliciesList, deletePrivacyPolicy } from './lib/api';

export default function PrivacyPolicyManagement() {
  const router = useRouter();
  const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPrivacyPolicies = async () => {
    try {
      const data = await getPrivacyPoliciesList();
      setPrivacyPolicies(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل سياسات الخصوصية');
      toast.error('فشل في تحميل سياسات الخصوصية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrivacyPolicies();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      return;
    }

    try {
      await deletePrivacyPolicy(id);
      await loadPrivacyPolicies();
      toast.success('تم حذف سياسة الخصوصية بنجاح');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف سياسة الخصوصية');
      toast.error('فشل في حذف سياسة الخصوصية');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">سياسة الخصوصية</h1>
        <button
          onClick={() => router.push('/dashboard/privacy-policy/add')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
        >
          إضافة سياسة جديدة
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-right">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-right">العنوان</th>
              <th className="px-6 py-3 text-right">تاريخ الإنشاء</th>
              <th className="px-6 py-3 text-right">آخر تعديل</th>
              <th className="px-6 py-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {privacyPolicies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  لا توجد سياسات خصوصية
                </td>
              </tr>
            ) : (
              privacyPolicies.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{item.title}</td>
                  <td className="px-6 py-4">
                    {new Date(item.createdDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(item.modifiedDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/privacy-policy/edit/${item.id}`)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Toaster />
    </div>
  );
}
