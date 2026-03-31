'use client';

import { useEffect, useRef, useState } from 'react';

interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CKEditorWrapper({ value, onChange, placeholder }: CKEditorWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [CKEditorComponent, setCKEditorComponent] = useState<any>(null);
  const [ClassicEditorBuild, setClassicEditorBuild] = useState<any>(null);
  const editorInstanceRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let mounted = true;
    (async () => {
      try {
        setLoadError(null);
        const [ckeditorReact, classicEditor] = await Promise.all([
          import('@ckeditor/ckeditor5-react'),
          import('@ckeditor/ckeditor5-build-classic'),
        ]);

        const CKEditor = (ckeditorReact as any).CKEditor;
        const ClassicEditor = (classicEditor as any).default ?? classicEditor;

        if (!mounted) return;
        setCKEditorComponent(() => CKEditor);
        setClassicEditorBuild(() => ClassicEditor);
      } catch (error) {
        console.error('CKEditor failed to load:', error);
        if (!mounted) return;
        setLoadError('تعذر تحميل محرر النصوص. حاول تحديث الصفحة.');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isClient]);

  useEffect(() => {
    const editor = editorInstanceRef.current;

    if (!editor || typeof value !== 'string') {
      return;
    }

    try {
      const currentData = editor.getData();

      if (currentData !== value) {
        editor.setData(value);
      }
    } catch (error) {
      console.error('CKEditor sync error:', error);
      setLoadError('تعذر تحميل محرر النصوص. يمكنك متابعة التحرير في الحقل البديل.');
    }
  }, [value]);

  if (loadError) {
    return (
      <div className="space-y-3">
        <div className="border border-red-300 rounded-md shadow-sm p-4 flex items-center justify-center">
          <p className="text-red-600 text-sm">{loadError}</p>
        </div>
        <textarea
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={12}
          className="block w-full min-h-[280px] rounded-md border border-gray-300 px-3 py-2 text-right text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="border border-gray-300 rounded-md shadow-sm p-4 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  if (!CKEditorComponent || !ClassicEditorBuild) {
    return (
      <div className="border border-gray-300 rounded-md shadow-sm p-4 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500">جاري تحميل المحرر...</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
      <CKEditorComponent
        disableWatchdog={true}
        editor={ClassicEditorBuild}
        data={value || ''}
        onReady={(editor: any) => {
          editorInstanceRef.current = editor;

          try {
            const currentData = editor.getData();

            if (currentData !== (value || '')) {
              editor.setData(value || '');
            }
          } catch (error) {
            console.error('CKEditor ready error:', error);
          }
        }}
        onAfterDestroy={(editor: any) => {
          if (editorInstanceRef.current === editor) {
            editorInstanceRef.current = null;
          }
        }}
        onChange={(_event: any, editor: any) => {
          try {
            const data = editor.getData();
            onChange(data);
          } catch (error) {
            console.error('CKEditor onChange error:', error);
          }
        }}
        onError={(error: any, details: { phase?: string; willEditorRestart?: boolean } = {}) => {
          console.error('CKEditor error:', error, details);

          if (details.phase === 'initialization' || details.willEditorRestart === false) {
            setLoadError('تعذر تحميل محرر النصوص. يمكنك متابعة التحرير في الحقل البديل.');
          }
        }}
        config={{
          language: 'ar',
          removePlugins: ['Title'],
          placeholder,
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'indent',
            'outdent',
            '|',
            'blockQuote',
            'insertTable',
            'undo',
            'redo'
          ]
        }}
      />
    </div>
  );
}
