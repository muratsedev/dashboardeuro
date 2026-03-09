'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRightIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { getApiEndpoint } from '@/lib/api-config';
import { toast } from 'react-hot-toast';

export default function EditSocialMediaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  console.log('Edit page loaded with ID:', id, 'Params:', params);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [removeCurrentIcon, setRemoveCurrentIcon] = useState(false);
  const [formData, setFormData] = useState({
    iconName: '',
    link: '',
    imagePath: '',
    isActivated: true,
  });

  const fetchSocialMedia = async () => {
    try {
      setFetchLoading(true);
      console.log('Fetching social media with ID:', id);
      const url = getApiEndpoint(`/api/SocialMedia/${id}`);
      console.log('Fetch URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch social media');
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      
      setFormData({
        iconName: data.iconName || '',
        link: data.link || '',
        imagePath: data.imagePath || '',
        isActivated: data.isActivated,
      });
    } catch (err) {
      console.error('Error fetching social media:', err);
      setError('فشل في تحميل بيانات وسيلة التواصل');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSocialMedia();
  import { getImageSrc } from '@/lib/imageHelpers';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setRemoveCurrentIcon(false); // Reset remove flag when new file is selected
    }
  };

  const handleRemoveIcon = () => {
    setRemoveCurrentIcon(true);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, imagePath: '' }));
    toast.success('سيتم حذف الأيقونة عند الحفظ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('IconName', formData.iconName);
      formDataToSend.append('Link', formData.link);
      formDataToSend.append('IsActivated', formData.isActivated.toString());
      
      if (selectedFile) {
        // New file selected - upload it
        formDataToSend.append('IconImage', selectedFile, selectedFile.name);
      } else if (removeCurrentIcon) {
        // User wants to remove the icon - send empty path
        formDataToSend.append('ImagePath', '');
      } else if (formData.imagePath) {
        // Keep existing image
        formDataToSend.append('ImagePath', formData.imagePath);
      }

      const response = await fetch(getApiEndpoint(`/api/SocialMedia/${id}`), {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update social media' }));
        throw new Error(errorData.error || 'Failed to update social media');
      }

      toast.success('تم تحديث وسيلة التواصل بنجاح');
      router.push('/dashboard/social-media');
    } catch (err) {
      console.error('Error updating social media:', err);
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث وسيلة التواصل';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (fetchLoading) {
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
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRightIcon className="h-5 w-5" />
          رجوع
        </button>
        <h1 className="text-2xl font-bold text-gray-900">تعديل وسيلة تواصل اجتماعي</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="iconName" className="block text-sm font-medium text-gray-700 text-right mb-2">
              اسم وسيلة التواصل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="iconName"
              name="iconName"
              required
              value={formData.iconName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
              placeholder="مثال: Facebook, Twitter, Instagram"
            />
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 text-right mb-2">
              الرابط <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="link"
              name="link"
              required
              value={formData.link}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
              placeholder="https://example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="imagePath" className="block text-sm font-medium text-gray-700 text-right mb-2">
              أيقونة وسيلة التواصل
            </label>
            
            {/* Current Image Preview */}
            {formData.imagePath && !previewUrl && !removeCurrentIcon && (
              <div className="mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-700 mb-2 text-right font-medium">الأيقونة الحالية:</p>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleRemoveIcon}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    حذف الأيقونة
                  </button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                      src={getImageSrc(formData.imagePath)} 
                    alt="Current icon" 
                    className="w-16 h-16 object-contain border rounded p-2"
                  />
                </div>
              </div>
            )}

            {/* Message when icon is marked for removal */}
            {removeCurrentIcon && !selectedFile && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-right">
                <p className="text-sm text-yellow-800">سيتم حذف الأيقونة عند الحفظ</p>
              </div>
            )}

            {/* File Upload */}
            <div className="mb-3">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {previewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={previewUrl} alt="Preview" className="w-16 h-16 object-contain mb-2" />
                  ) : (
                    <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                  )}
                  <p className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'اضغط لتحميل أيقونة جديدة'}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <label htmlFor="isActivated" className="text-sm font-medium text-gray-700">
              تفعيل وسيلة التواصل
            </label>
            <input
              type="checkbox"
              id="isActivated"
              name="isActivated"
              checked={formData.isActivated}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
