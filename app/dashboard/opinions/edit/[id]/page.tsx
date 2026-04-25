"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { getOpinion, updateOpinion, getAuthors, getTags } from "../../lib/api";
import RichTextEditor from "../../../../../components/RichTextEditor";
import { normalizeImageUrl } from "../../../../../lib/imageHelpers";

export default function EditOpinionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<{ id: number; fullName: string | null }[]>([]);
  const [tags, setTags] = useState<{ tagId: number; tagName: string }[]>([]);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [authorId, setAuthorId] = useState<number | "">("");
  const [tagId, setTagId] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [opinion, authorsData, tagsData] = await Promise.all([
          getOpinion(id),
          getAuthors(),
          getTags(),
        ]);

        setTitle(opinion.title);
        setSummary(opinion.summary);
        setContent(opinion.content);
        setIsPublished(opinion.isPublished);
        setAuthorId(opinion.authorId ?? "");
        setTagId(opinion.tagId ?? "");
        if (opinion.imagePath) {
          setCurrentImage(normalizeImageUrl(opinion.imagePath));
          setImagePreview(normalizeImageUrl(opinion.imagePath));
        }
        setAuthors(authorsData);
        setTags(tagsData);
      } catch (err) {
        toast.error("فشل في تحميل بيانات المقال");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : currentImage);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "العنوان مطلوب";
    if (!summary.trim()) newErrors.summary = "الملخص مطلوب";
    if (!content.trim()) newErrors.content = "المحتوى مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await updateOpinion(
        id,
        {
          title: title.trim(),
          summary: summary.trim(),
          content,
          isPublished,
          authorId: authorId !== "" ? Number(authorId) : 0,
          tagId: tagId !== "" ? Number(tagId) : 0,
          updatedDate: new Date().toISOString(),
        },
        imageFile ?? undefined
      );
      toast.success("تم تحديث المقال بنجاح");
      router.push("/dashboard/opinions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل في تحديث المقال");
    } finally {
      setIsSubmitting(false);
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
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="رجوع"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">تعديل المقال</h1>
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العنوان <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
              placeholder="عنوان المقال"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الملخص <span className="text-red-500">*</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
              placeholder="ملخص المقال"
            />
            {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المحتوى <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="محتوى المقال..."
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>

          {/* Author & Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الكاتب</label>
              <select
                value={authorId}
                onChange={(e) =>
                  setAuthorId(e.target.value !== "" ? Number(e.target.value) : "")
                }
                aria-label="اختر كاتباً"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
              >
                <option value="">— اختر كاتباً —</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName ?? `كاتب #${a.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوسم</label>
              <select
                value={tagId}
                onChange={(e) =>
                  setTagId(e.target.value !== "" ? Number(e.target.value) : "")
                }
                aria-label="اختر وسماً"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
              >
                <option value="">— اختر وسماً —</option>
                {tags.map((t) => (
                  <option key={t.tagId} value={t.tagId}>
                    {t.tagName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الصورة</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative w-24 h-16 rounded overflow-hidden border border-gray-200">
                  <Image
                    src={imagePreview}
                    alt="معاينة الصورة"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {imagePreview ? "تغيير الصورة" : "رفع صورة"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="رفع صورة المقال"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">نشر المقال</label>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              aria-label={isPublished ? "إلغاء النشر" : "نشر المقال"}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isPublished ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isPublished ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-500">
              {isPublished ? "منشور" : "مسودة"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
