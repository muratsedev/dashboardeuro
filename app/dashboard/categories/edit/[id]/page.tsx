'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryAll } from '../../../articles/types/Category';
import { getCategories, updateCategory } from '../../../articles/lib/api';

interface EditCategoryProps {
  params: Promise<{
    id: string;
  }>;
}


export default function EditCategory({ params }: EditCategoryProps) {
  const router = useRouter();
  const { id } = use(params);
  const categoryId = parseInt(id);
  const [formData, setFormData] = useState<CategoryAll>({
    id: categoryId,
    name: '',
    categorySlug: '',
    isActivated: true,
    isShowInFooter: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categories = await getCategories();
        const category = categories.find(c => c.id === categoryId);
        if (!category) {          setError('لم يتم العثور على التصنيف');
          return;
        }
        // Ensure all boolean fields have defined values
        setFormData({
          ...category,
          isShowInFooter: category.isShowInFooter ?? false
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل في تحميل التصنيف');
      }
    };
    loadCategory();
  }, [categoryId]);
  const generateSlug = (text: string) => {
    // Convert Arabic numerals to English numerals
    const numeralsMap: { [key: string]: string } = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };

    return text
      .split('')
      .map(char => numeralsMap[char] || char) // Convert numerals
      .join('')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .replace(/^-+/, '') // Remove leading hyphens
      .replace(/-+$/, ''); // Remove trailing hyphens
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      console.log(`Checkbox ${name} changed to:`, checked);
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    // Handle normal text input
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generate slug from name if it's the name field being changed
    if (name === 'name') {
      const slug = generateSlug(value);
      setFormData(prev => ({ ...prev, categorySlug: slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    console.log('=== Submitting Category Update ===');
    console.log('Form Data:', formData);
    console.log('IsActivated:', formData.isActivated);
    console.log('IsShowInFooter:', formData.isShowInFooter);
    
    try {
      await updateCategory(formData.id, formData);
      router.push('/dashboard/categories');
      router.refresh();
    } catch (err) {
      console.error('Update Error:', err);
      setError(err instanceof Error ? err.message : 'فشل في تحديث التصنيف');
      setIsSubmitting(false);
    }
  };
  if (error === 'لم يتم العثور على التصنيف') {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 text-right">
          لم يتم العثور على التصنيف
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">تعديل التصنيف</h1>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right">
              اسم التصنيف
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
            />
          </div>
          
          <div>
            <label htmlFor="categorySlug" className="block text-sm font-medium text-gray-700 text-right">
              الرابط المختصر
            </label>
            <input
              type="text"
              id="categorySlug"
              name="categorySlug"
              required
              value={formData.categorySlug}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
              dir="ltr"
            />
            <p className="mt-1 text-sm text-gray-500 text-right">
              سيتم إنشاء الرابط تلقائياً من اسم التصنيف، ويمكنك تعديله إذا أردت.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
              حالة التصنيف
            </label>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors" dir="rtl">
              <div className="flex items-center">
                <div className="flex flex-col text-right">
                  <span id="toggle-label" className="text-sm font-medium text-gray-900 mb-1">
                    التصنيف نشط
                  </span>
                  <span className="text-xs text-gray-500">
                    {formData.isActivated ? 'سيظهر التصنيف للمستخدمين' : 'التصنيف مخفي عن المستخدمين'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 min-h-[40px]">
                <span className={`text-sm font-medium whitespace-nowrap mr-3 ${formData.isActivated ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData.isActivated ? 'نشط' : 'غير نشط'}
                </span>
                <div
                  role="button"
                  tabIndex={0}
                  aria-labelledby="toggle-label"
                  title={formData.isActivated ? 'إلغاء تنشيط التصنيف' : 'تنشيط التصنيف'}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    formData.isActivated ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  onClick={() => {
                    const newValue = !formData.isActivated;
                    console.log('Toggle clicked, setting to:', newValue);
                    setFormData(prev => ({ ...prev, isActivated: newValue }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const newValue = !formData.isActivated;
                      setFormData(prev => ({ ...prev, isActivated: newValue }));
                    }
                  }}
                >
                  <span className="sr-only">تبديل حالة التصنيف</span>
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-200 ease-in-out ${
                      formData.isActivated ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
                <input
                  type="checkbox"
                  id="isActivated"
                  name="isActivated"
                  checked={!!formData.isActivated}
                  onChange={() => {}} // Controlled by the toggle above
                  className="sr-only"
                  aria-label="حالة التصنيف"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
              عرض في التذييل
            </label>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors" dir="rtl">
              <div className="flex items-center">
                <div className="flex flex-col text-right">
                  <span id="footer-toggle-label" className="text-sm font-medium text-gray-900 mb-1">
                    إظهار التصنيف في التذييل
                  </span>
                  <span className="text-xs text-gray-500">
                    {formData.isShowInFooter ? 'سيظهر التصنيف في تذييل الموقع' : 'لن يظهر التصنيف في التذييل'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 min-h-[40px]">
                <span className={`text-sm font-medium whitespace-nowrap mr-3 ${formData.isShowInFooter ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData.isShowInFooter ? 'معروض' : 'غير معروض'}
                </span>
                <div
                  role="button"
                  tabIndex={0}
                  aria-labelledby="footer-toggle-label"
                  title={formData.isShowInFooter ? 'إلغاء عرض التصنيف في التذييل' : 'عرض التصنيف في التذييل'}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    formData.isShowInFooter ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  onClick={() => {
                    const newValue = !formData.isShowInFooter;
                    console.log('Footer toggle clicked, setting to:', newValue);
                    setFormData(prev => ({ ...prev, isShowInFooter: newValue }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const newValue = !formData.isShowInFooter;
                      console.log('Footer toggle key pressed, setting to:', newValue);
                      setFormData(prev => ({ ...prev, isShowInFooter: newValue }));
                    }
                  }}
                >
                  <span className="sr-only">تبديل عرض التصنيف في التذييل</span>
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-200 ease-in-out ${
                      formData.isShowInFooter ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
                <input
                  type="checkbox"
                  id="isShowInFooter"
                  name="isShowInFooter"
                  checked={!!formData.isShowInFooter}
                  onChange={() => {}} // Controlled by the toggle above
                  className="sr-only"
                  aria-label="عرض في التذييل"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
