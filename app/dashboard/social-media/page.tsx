'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { getApiEndpoint } from '@/lib/api-config';
import { getImageSrc } from '@/lib/imageHelpers';
import { toast } from 'react-hot-toast';

interface SocialMedia {
  socialMediaId: number;
  iconName: string;
  link: string;
  imagePath: string;
  isActivated: boolean;
}

export default function SocialMediaPage() {
  const router = useRouter();
  const [socialMedias, setSocialMedias] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialMedias();
  }, []);

  const fetchSocialMedias = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiEndpoint('/api/SocialMedia'));
      if (!response.ok) {
        throw new Error('Failed to fetch social media');
      }
      const data = await response.json();
      setSocialMedias(data);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل وسائل التواصل الاجتماعي');
      console.error('Error fetching social media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف وسيلة التواصل هذه؟')) {
      return;
    }

    try {
      const response = await fetch(getApiEndpoint(`/api/SocialMedia/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete social media');
      }

      toast.success('تم حذف وسيلة التواصل بنجاح');
      await fetchSocialMedias();
    } catch (err) {
      console.error('Error deleting social media:', err);
      toast.error('فشل في حذف وسيلة التواصل');
    }
  };

  const toggleActivation = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(getApiEndpoint(`/api/SocialMedia/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActivated: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update social media');
      }

      toast.success('تم تحديث حالة وسيلة التواصل بنجاح');
      await fetchSocialMedias();
    } catch (err) {
      console.error('Error updating social media:', err);
      toast.error('فشل في تحديث حالة وسيلة التواصل');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/dashboard/social-media/create')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة وسيلة تواصل
        </button>
        <h1 className="text-2xl font-bold text-gray-900">وسائل التواصل الاجتماعي</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {socialMedias.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">لا توجد وسائل تواصل اجتماعي</p>
            <button
              onClick={() => router.push('/dashboard/social-media/create')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              إضافة وسيلة تواصل جديدة
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الأيقونة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرابط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {socialMedias.map((sm) => (
                <tr key={sm.socialMediaId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">{sm.iconName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {sm.imagePath ? (
                      <div className="relative w-10 h-10">
                        <Image
                          src={getImageSrc(sm.imagePath)}
                          alt={sm.iconName}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">لا توجد أيقونة</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={sm.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 hover:underline max-w-xs truncate block"
                      title={sm.link}
                    >
                      {sm.link}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => toggleActivation(sm.socialMediaId, sm.isActivated)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sm.isActivated
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {sm.isActivated ? 'مفعل' : 'معطل'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    <div className="flex gap-2 justify-start">
                      <button
                        onClick={() => router.push(`/dashboard/social-media/${sm.socialMediaId}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="تعديل"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sm.socialMediaId)}
                        className="text-red-600 hover:text-red-900"
                        title="حذف"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
