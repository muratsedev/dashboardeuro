"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { getOpinions, deleteOpinion } from "./lib/api";
import { Opinion } from "./types/Opinion";

export default function OpinionsPage() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();

  const fetchOpinions = async () => {
    try {
      setIsLoading(true);
      const data = await getOpinions();
      setOpinions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpinions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
    try {
      await deleteOpinion(id);
      toast.success("تم حذف المقال بنجاح");
      fetchOpinions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل في حذف المقال");
    }
  };

  const totalPages = Math.ceil(opinions.length / itemsPerPage);
  const currentItems = opinions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg text-right">
          <h3 className="text-lg font-semibold text-red-800 mb-2">خطأ في الاتصال</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOpinions}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">مقالات</h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة مقالات الرأي</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {opinions.length} مقال
          </span>
          <Link
            href="/dashboard/opinions/add"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة مقال
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العنوان
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكاتب
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الوسم
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  لا توجد مقالات
                </td>
              </tr>
            ) : (
              currentItems.map((opinion) => (
                <tr key={opinion.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                    <div className="truncate font-medium">{opinion.title}</div>
                    {opinion.summary && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {opinion.summary}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {opinion.authorName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {opinion.tagName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                        opinion.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {opinion.isPublished ? "منشور" : "مسودة"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {opinion.createdDate
                      ? new Date(opinion.createdDate).toLocaleDateString("ar-EG")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/opinions/edit/${opinion.id}`)
                        }
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="تعديل"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(opinion.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="حذف"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded text-sm ${
                page === currentPage
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
