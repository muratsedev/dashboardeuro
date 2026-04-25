"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getPodcasts, createPodcast, updatePodcast, deletePodcast } from "./lib/api";
import { Podcast, CreatePodcastDto, UpdatePodcastDto } from "./types/Podcast";
import PodcastPlayer from "../../../components/PodcastPlayer";
import { WorkflowBadge, WorkflowStatus } from "../../../components/WorkflowBadge";

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [formData, setFormData] = useState<CreatePodcastDto>({
    podcastTitle: "",
    podcastSummary: "",
    podcastLink: "",
    isPublished: true,
  });

  const fetchPodcasts = async () => {
    try {
      setIsLoading(true);
      const data = await getPodcasts();
      setPodcasts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching podcasts:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPodcast) {
        const updateData: UpdatePodcastDto = {
          podcastTitle: formData.podcastTitle,
          podcastSummary: formData.podcastSummary,
          podcastLink: formData.podcastLink,
          isPublished: formData.isPublished,
        };
        await updatePodcast(editingPodcast.podcastId, updateData);
        toast.success("تم تحديث البودكاست بنجاح");
      } else {
        await createPodcast(formData);
        toast.success("تم إنشاء البودكاست بنجاح");
      }
      
      fetchPodcasts();
      closeModal();
    } catch (err) {
      console.error("Error saving podcast:", err);
      toast.error("فشل حفظ البودكاست");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا البودكاست؟")) return;
    
    try {
      await deletePodcast(id);
      toast.success("تم حذف البودكاست بنجاح");
      fetchPodcasts();
    } catch (err) {
      console.error("Error deleting podcast:", err);
      toast.error("فشل حذف البودكاست");
    }
  };

  const openModal = (podcast?: Podcast) => {
    if (podcast) {
      setEditingPodcast(podcast);
      setFormData({
        podcastTitle: podcast.podcastTitle,
        podcastSummary: podcast.podcastSummary || "",
        podcastLink: podcast.podcastLink,
        isPublished: podcast.isPublished,
      });
    } else {
      setEditingPodcast(null);
      setFormData({
        podcastTitle: "",
        podcastSummary: "",
        podcastLink: "",
        isPublished: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPodcast(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">خطأ: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">إدارة البودكاست</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة بودكاست
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بعنوان البودكاست..."
          className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="rtl"
        />
      </div>

      {podcasts.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بودكاست</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة بودكاست جديد</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              إضافة بودكاست
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العنوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الملخص
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معاينة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {podcasts
                .filter((p) => !searchQuery || p.podcastTitle.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((podcast) => (
                <tr key={podcast.podcastId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {podcast.podcastTitle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {podcast.podcastSummary ? (
                      <span className="line-clamp-2">{podcast.podcastSummary}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <PodcastPlayer
                      url={podcast.podcastLink}
                      title={podcast.podcastTitle}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        podcast.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {podcast.isPublished ? "منشور" : "غير منشور"}
                    </span>
                    <div className="mt-1">
                      <WorkflowBadge status={(podcast.workflowStatus ?? 0) as WorkflowStatus} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(podcast)}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label="تعديل البودكاست"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(podcast.podcastId)}
                        className="text-red-600 hover:text-red-900"
                        aria-label="حذف البودكاست"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingPodcast ? "تعديل البودكاست" : "إضافة بودكاست جديد"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="إغلاق"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان البودكاست <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.podcastTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, podcastTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل عنوان البودكاست"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الملخص
                </label>
                <textarea
                  value={formData.podcastSummary}
                  onChange={(e) =>
                    setFormData({ ...formData, podcastSummary: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل ملخص البودكاست"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رابط البودكاست <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.podcastLink}
                  onChange={(e) =>
                    setFormData({ ...formData, podcastLink: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="mr-2 block text-sm text-gray-900">
                  نشر البودكاست
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  {editingPodcast ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
