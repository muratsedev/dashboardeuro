'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Create a wrapper component for CKEditor
const CKEditorWrapper = dynamic<RichTextEditorProps>(
  () => import('./CKEditorWrapper'),
  { 
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-md shadow-sm p-4 min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل المحرر...</p>
        </div>
      </div>
    )
  }
);

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    try {
      setError(null);
      onChange(newValue);
    } catch (err) {
      setError('حدث خطأ في المحرر');
      console.error('RichTextEditor error:', err);
    }
  };

  if (error) {
    return (
      <div className="border border-red-300 rounded-md shadow-sm p-4 min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return <CKEditorWrapper value={value} onChange={handleChange} placeholder={placeholder} />;
}
