"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getVideos, createVideo, updateVideo, deleteVideo } from "./lib/api";
import { Video, CreateVideoDto, UpdateVideoDto } from "./types/Video";

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1).split('?')[0];
    } else if (
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtube.com'
    ) {
      videoId = parsed.searchParams.get('v');
      if (!videoId && parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.replace('/embed/', '').split('?')[0];
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState<CreateVideoDto>({
    videoTitle: "",
    videoSummary: "",
    videoLink: "",
    isPublished: true,
    tagId: undefined,
  });

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const data = await getVideos();
      setVideos(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVideo) {
        const updateData: UpdateVideoDto = {
          videoTitle: formData.videoTitle,
          videoSummary: formData.videoSummary,
          videoLink: formData.videoLink,
          isPublished: formData.isPublished,
          tagId: formData.tagId,
        };
        await updateVideo(editingVideo.videoId, updateData);
        toast.success("تم تحديث الفيديو بنجاح");
      } else {
        await createVideo(formData);
        toast.success("تم إنشاء الفيديو بنجاح");
      }
      
      fetchVideos();
      closeModal();
    } catch (err) {
      console.error("Error saving video:", err);
      toast.error("فشل حفظ الفيديو");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفيديو؟")) return;
    
    try {
      await deleteVideo(id);
      toast.success("تم حذف الفيديو بنجاح");
      fetchVideos();
    } catch (err) {
      console.error("Error deleting video:", err);
      toast.error("فشل حذف الفيديو");
    }
  };

  const openModal = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        videoTitle: video.videoTitle,
        videoSummary: video.videoSummary || "",
        videoLink: video.videoLink,
        isPublished: video.isPublished,
        tagId: video.tagId,
      });
    } else {
      setEditingVideo(null);
      setFormData({
        videoTitle: "",
        videoSummary: "",
        videoLink: "",
        isPublished: true,
        tagId: undefined,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
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
        <h1 className="text-3xl font-bold text-gray-800">إدارة الفيديوهات</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة فيديو
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بعنوان الفيديو..."
          className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="rtl"
        />
      </div>

      {videos.length === 0 ? (
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فيديوهات</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة فيديو جديد</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              إضافة فيديو
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
              {videos
                .filter((v) => !searchQuery || v.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((video) => (
                <tr key={video.videoId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {video.videoTitle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {video.videoSummary ? (
                      <span className="line-clamp-2">{video.videoSummary}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const embedUrl = getYouTubeEmbedUrl(video.videoLink);
                      return embedUrl ? (
                        <iframe
                          src={embedUrl}
                          className="rounded"
                          width="200"
                          height="113"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={video.videoTitle}
                        />
                      ) : (
                        <a
                          href={video.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          {video.videoLink.substring(0, 50)}...
                        </a>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        video.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {video.isPublished ? "منشور" : "غير منشور"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(video)}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label="تعديل الفيديو"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.videoId)}
                        className="text-red-600 hover:text-red-900"
                        aria-label="حذف الفيديو"
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
                {editingVideo ? "تعديل الفيديو" : "إضافة فيديو جديد"}
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
                  عنوان الفيديو <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.videoTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, videoTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل عنوان الفيديو"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الملخص
                </label>
                <textarea
                  value={formData.videoSummary}
                  onChange={(e) =>
                    setFormData({ ...formData, videoSummary: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل ملخص الفيديو"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رابط الفيديو <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.videoLink}
                  onChange={(e) =>
                    setFormData({ ...formData, videoLink: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..."
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
                  نشر الفيديو
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
                  {editingVideo ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
