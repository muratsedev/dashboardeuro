import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CategoryAll } from '../app/dashboard/articles/types/Category';
import EmptyState from './EmptyState';

interface CategoryTableProps {
  categories: CategoryAll[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  console.log('CategoryTable rendering with categories:', categories);
  
  if (categories.length === 0) {
    return (
      <EmptyState
        title="لا توجد تصنيفات"
        description="ابدأ بإنشاء تصنيفك الأول لتنظيم المقالات"
        actionLabel="إضافة تصنيف جديد"
        actionHref="/dashboard/categories/add"
        icon={
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-1/4 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم التصنيف</th>
              <th className="w-1/4 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرابط المختصر</th>
              <th className="w-1/6 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
              <th className="w-1/5 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">عرض في التذييل</th>
              <th className="w-1/6 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="w-1/4 px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">{category.name || 'غير محدد'}</td>
                <td className="w-1/4 px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{category.categorySlug || 'غير محدد'}</td>
                <td className="w-1/6 px-6 py-4 whitespace-nowrap text-center text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${category.isActivated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {category.isActivated ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="w-1/5 px-6 py-4 whitespace-nowrap text-center text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${category.isShowInFooter ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {category.isShowInFooter ? 'معروض' : 'غير معروض'}
                  </span>
                </td>
                <td className="w-1/6 px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEdit(category.id)} 
                      className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors" 
                      aria-label="تعديل التصنيف" 
                      title="تعديل"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(category.id)} 
                      className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors" 
                      aria-label="حذف التصنيف" 
                      title="حذف"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
