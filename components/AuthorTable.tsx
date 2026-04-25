import Image from 'next/image';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Author } from '../app/dashboard/authors/types/Author';
import EmptyState from './EmptyState';

interface AuthorTableProps {
  authors: Author[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function AuthorTable({ authors, onEdit, onDelete }: AuthorTableProps) {
  if (authors.length === 0) {
    return (
      <EmptyState
        title="لا يوجد كتّاب"
        description="ابدأ بإضافة أول كاتب رأي"
        actionLabel="إضافة كاتب"
        actionHref="/dashboard/authors/add"
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {authors.map((author) => (
        <div
          key={author.id}
          className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between px-5 py-4 gap-4 hover:shadow-md transition-shadow"
        >
          {/* Right: info + actions */}
          <div className="flex flex-col gap-3 flex-1 text-right">
            <div>
              <p className="text-base font-bold text-gray-900 leading-tight">
                {author.fullName ?? '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">المعرف #{author.id}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => onEdit(author.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium border border-emerald-500 text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
              >
                <PencilIcon className="h-3.5 w-3.5" />
                تعديل
              </button>
              <button
                onClick={() => onDelete(author.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium border border-red-400 text-red-500 rounded-md hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                حذف
              </button>
            </div>
          </div>

          {/* Left: avatar */}
          <div className="shrink-0">
            {author.profilePictureUrl ? (
              <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-gray-100">
                <Image
                  src={author.profilePictureUrl}
                  alt={author.fullName ?? ''}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-gray-100">
                <span className="text-indigo-600 font-bold text-2xl">
                  {(author.fullName ?? '?').charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
