'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { getAuthor, updateAuthor } from '../../lib/api';

export default function EditAuthorPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [existingPictureUrl, setExistingPictureUrl] = useState<string | null>(null);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const author = await getAuthor(id);
        setFullName(author.fullName ?? '');
        setBio(author.bio ?? '');
        setExistingPictureUrl(author.profilePictureUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل في تحميل بيانات الكاتب');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPictureFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('الاسم الكامل مطلوب');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateAuthor(id, {
        fullName: fullName.trim(),
        bio: bio.trim(),
        profilePicture: pictureFile ?? undefined,
      });
      toast.success('تم تحديث بيانات الكاتب بنجاح');
      startTransition(() => { router.push('/dashboard/authors'); });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل في تحديث الكاتب';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const displayImage = preview ?? existingPictureUrl;

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="رجوع"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">تعديل الكاتب</h1>
      </div>

      <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-right">
              {error}
            </div>
          )}

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">صورة الكاتب</label>
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt="معاينة"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <span className="text-gray-400 text-xs text-center px-1">اختر صورة</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                تغيير الصورة
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="رفع صورة الكاتب"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
              maxLength={200}
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">نبذة تعريفية</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>

      <Toaster />
    </div>
  );
}
