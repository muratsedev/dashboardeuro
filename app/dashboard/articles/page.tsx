"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { getArticles } from "./lib/api";
import { ArticleAll } from "./types/Article";
import EmptyState from "../../../components/EmptyState";
import { getApiUrl } from "../../../lib/api-config";
import { WorkflowBadge, WorkflowStatus } from "../../../components/WorkflowBadge";

export default function Articles() {
  const [articles, setArticles] = useState<ArticleAll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'articleTitle' | 'isPublished' | 'createdDate' | 'categoryName' | 'editorChoice'>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const articlesPerPage = 20;

  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get('filter');
  const isEditorChoiceFilter = filterParam === 'editorChoice';

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching articles from API...');
      
      const data = await getArticles();
      console.log('Articles data received:', data);
      setArticles(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSort = (field: 'articleTitle' | 'isPublished' | 'createdDate' | 'categoryName' | 'editorChoice') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedArticles = () => {
    return [...articles].sort((a, b) => {
      if (sortField === 'articleTitle') {
        return sortDirection === 'asc' 
          ? a.articleTitle.localeCompare(b.articleTitle)
          : b.articleTitle.localeCompare(a.articleTitle);
      } else if (sortField === 'isPublished') {
        return sortDirection === 'asc'
          ? Number(a.isPublished) - Number(b.isPublished)
          : Number(b.isPublished) - Number(a.isPublished);
      } else if (sortField === 'categoryName') {
        const categoryA = a.categoryName || a.category?.name || '';
        const categoryB = b.categoryName || b.category?.name || '';
        return sortDirection === 'asc'
          ? categoryA.localeCompare(categoryB)
          : categoryB.localeCompare(categoryA);
      } else if (sortField === 'editorChoice') {
        const editorChoiceA = a.editorChoice ? 1 : 0;
        const editorChoiceB = b.editorChoice ? 1 : 0;
        return sortDirection === 'asc'
          ? editorChoiceA - editorChoiceB
          : editorChoiceB - editorChoiceA;
      } else {
        return sortDirection === 'asc'
          ? (a.createdDate ? new Date(a.createdDate).getTime() : 0) - (b.createdDate ? new Date(b.createdDate).getTime() : 0)
          : (b.createdDate ? new Date(b.createdDate).getTime() : 0) - (a.createdDate ? new Date(a.createdDate).getTime() : 0);
      }
    });
  };

  // Get current articles for pagination (with search filter and optional editorChoice filter)
  const sortedArticles = getSortedArticles().filter((a) => {
    if (isEditorChoiceFilter && !a.editorChoice) return false;
    if (searchQuery && !a.articleTitle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.ceil(sortedArticles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = sortedArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    const apiUrl = getApiUrl();
    const isLocalhostError = apiUrl.includes('localhost');
    const isEnvVarMissing = !process.env.NEXT_PUBLIC_API_URL && typeof window !== 'undefined' && window.location.hostname !== 'localhost';
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-red-800 mb-2">خطأ في الاتصال</h3>
          <p className="text-red-600 mb-4">فشل في الاتصال بالخادم</p>
          
          {isEnvVarMissing && (
            <div className="bg-blue-100 border border-blue-300 rounded p-4 mb-4 text-right">
              <h4 className="font-bold text-blue-900 mb-2">ℹ️ ملاحظة</h4>
              <p className="text-sm text-blue-800 mb-2">
                المتغير <code className="bg-blue-200 px-1 rounded">NEXT_PUBLIC_API_URL</code> غير معرف في Vercel.
                نستخدم الآن الرابط الافتراضي للإنتاج.
              </p>
              <p className="text-sm text-blue-800">
                للحصول على أفضل أداء، يُنصح بإضافة المتغير في إعدادات Vercel.
              </p>
            </div>
          )}
          
          {isLocalhostError && (
            <div className="bg-yellow-100 border border-yellow-300 rounded p-4 mb-4 text-right">
              <h4 className="font-bold text-yellow-900 mb-2">⚠️ متغير البيئة غير مُعرّف</h4>
              <p className="text-sm text-yellow-800 mb-2">
                المتغير <code className="bg-yellow-200 px-1 rounded">NEXT_PUBLIC_API_URL</code> غير معرف في Vercel
              </p>
              <p className="text-sm text-yellow-800 mb-2">
                الرجاء إضافة المتغير في إعدادات Vercel:
              </p>
              <ol className="text-sm text-yellow-900 list-decimal list-inside space-y-1 mr-2">
                <li>اذهب إلى Vercel Dashboard → Settings → Environment Variables</li>
                <li>أضف متغير جديد: NEXT_PUBLIC_API_URL</li>
                <li>القيمة: <code className="bg-yellow-200 px-1 rounded text-xs">https://euronews-001-site1.stempurl.com</code></li>
                <li>اختر جميع البيئات (Production, Preview, Development)</li>
                <li>احفظ وأعد النشر</li>
              </ol>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-4">
            تأكد من أن الخادم يعمل والاتصال بالإنترنت متاح
          </p>
          
          <button
            onClick={() => {
              setError(null);
              fetchArticles();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors mb-4"
          >
            إعادة المحاولة
          </button>
          
          <details className="mt-4 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">تفاصيل الخطأ (للمطورين)</summary>
            <div className="mt-2 bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-auto">
              <div className="mb-2">
                <strong className="text-yellow-400">Error:</strong> {error}
              </div>
              <div className="mb-2">
                <strong className="text-yellow-400">API URL:</strong> {apiUrl}
              </div>
              <div>
                <strong className="text-yellow-400">Status:</strong> {isLocalhostError ? 'Using localhost (WRONG for production!)' : 'Using production URL'}
              </div>
            </div>
          </details>
        </div>
      </div>
    );
  }
  
  const handleViewArticle = (id: string) => {
    router.push(`/dashboard/articles/${id}`);
  };

  const handleEditArticle = (id: string) => {
    router.push(`/dashboard/articles/edit/${id}`);
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المقال؟")) {
      try {
        const response = await fetch(`${getApiUrl()}/api/Articles/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete article");
        }

        // Remove the article from the local state
        setArticles(articles.filter((article) => article.id !== id));

        toast.success("تم حذف المقال بنجاح", {
          position: "bottom-center",
          duration: 3000,
          style: {
            background: "#22C55E",
            color: "#fff",
            direction: "rtl",
          },
        });    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء حذف المقال";
      toast.error(errorMessage, {
        position: "bottom-center",
        duration: 3000,
        style: {
          background: "#EF4444",
          color: "#fff",
          direction: "rtl",
        },
      });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-b-4 border-custom-green rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Toaster />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <Link
          href="/dashboard/articles/add"
          className="w-full sm:w-auto px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-custom-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة خبر جديد
        </Link>

        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditorChoiceFilter ? 'اختيار المحرر' : 'الأخبار'}
        </h1>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder="بحث بعنوان الخبر..."
          className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="rtl"
        />
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title="لا توجد مقالات حالياً"
          description="ابدأ بإنشاء مقالك الأول"
          actionLabel="إضافة مقال جديد"
          actionHref="/dashboard/articles/add"
        />
      ) : isEditorChoiceFilter && sortedArticles.length === 0 ? (
        <EmptyState
          title="لا توجد مقالات باختيار المحرر"
          description="يمكنك تعيين مقالات كاختيار المحرر من صفحة تعديل المقال"
          actionLabel="عرض جميع المقالات"
          actionHref="/dashboard/articles"
        />
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('articleTitle')}
                  >
                    العنوان {sortField === 'articleTitle' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('categoryName')}
                  >
                    التصنيف {sortField === 'categoryName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('isPublished')}
                  >
                    الحالة {sortField === 'isPublished' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('editorChoice')}
                  >
                    اختيار المحرر {sortField === 'editorChoice' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('createdDate')}
                  >
                    تاريخ الإنشاء {sortField === 'createdDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    سير العمل
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentArticles.map((article) => {
                  // Debug logging for each article
                  console.log(`Article: ${article.articleTitle}, isPublished: ${article.isPublished}, type: ${typeof article.isPublished}`);
                  
                  return (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 text-right">
                        {article.articleTitle}
                      </div>
                      <div className="text-sm text-gray-500 text-right truncate max-w-xs">
                        {article.articleSummary}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 text-right">
                        {article.categoryName || article.category?.name || 'غير محدد'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          article.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {article.isPublished ? "منشورة" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {article.editorChoice ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          ✓ اختيار المحرر
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {article.createdDate ? new Date(article.createdDate).toLocaleDateString("en-GB", {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        calendar: 'gregory'
                      }) : "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <WorkflowBadge status={(article.workflowStatus ?? 0) as WorkflowStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button
                        onClick={() => handleViewArticle(article.id)}
                        title="عرض المقال"
                        className="text-custom-green hover:text-custom-green-dark ml-3"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditArticle(article.id)}
                        title="تعديل المقال"
                        className="text-custom-green hover:text-custom-green-dark ml-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        title="حذف المقال"
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  السابق
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    عرض{' '}
                    <span className="font-medium">{indexOfFirstArticle + 1}</span>
                    {' '}إلى{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastArticle, sortedArticles.length)}
                    </span>
                    {' '}من{' '}
                    <span className="font-medium">{sortedArticles.length}</span>
                    {' '}مقال
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">السابق</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {getPageNumbers().map((pageNumber, index) => (
                      pageNumber === '...' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber as number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-green-50 border-green-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">التالي</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
