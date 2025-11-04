'use client';

import { useState } from 'react';

interface ArticleData {
  id: string;
  articleTitle?: string;
  articleSummary?: string;
  articleContent?: string;
  content?: string;
  categoryId?: number;
  category?: unknown;
  tagId?: number | null;
  podcastTypeId?: number | null;
  upperArticleId?: number | null;
  imagePath?: string;
}

interface TestResult {
  success: boolean;
  status: number;
  dataLength: number | string;
  sampleData: unknown;
  apiUrl: string;
  specificArticleTest?: {
    id: string;
    success: boolean;
    data?: ArticleData;
    error?: string;
    fieldsPresent?: {
      [key: string]: boolean;
    };
  };
}

export default function TestConnectionPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7065';
      
      console.log('Testing connection to:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/Articles`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON: ${parseError}, Response: ${responseText.substring(0, 200)}...`);
      }

      console.log('Parsed data:', data);

      // Test a specific article if any exist
      let specificArticleTest = null;
      if (Array.isArray(data) && data.length > 0) {
        const firstArticleId = data[0].id;
        try {
          const articleResponse = await fetch(`${apiUrl}/api/Articles/${firstArticleId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (articleResponse.ok) {
            const articleText = await articleResponse.text();
            const articleData = JSON.parse(articleText);
            specificArticleTest = {
              id: firstArticleId,
              success: true,
              data: articleData,
              fieldsPresent: {
                articleTitle: !!articleData.articleTitle,
                articleSummary: !!articleData.articleSummary,
                articleContent: !!articleData.articleContent,
                content: !!articleData.content,
                categoryId: !!articleData.categoryId,
                category: !!articleData.category,
                tagId: articleData.tagId !== null && articleData.tagId !== undefined,
                podcastTypeId: articleData.podcastTypeId !== null && articleData.podcastTypeId !== undefined,
                upperArticleId: articleData.upperArticleId !== null && articleData.upperArticleId !== undefined,
                imagePath: !!articleData.imagePath
              }
            };
          }
        } catch (articleError) {
          specificArticleTest = {
            id: firstArticleId,
            success: false,
            error: articleError instanceof Error ? articleError.message : String(articleError)
          };
        }
      }

      setResult({
        success: true,
        status: response.status,
        dataLength: Array.isArray(data) ? data.length : 'Not an array',
        sampleData: Array.isArray(data) ? data[0] : data,
        apiUrl: apiUrl,
        specificArticleTest: specificArticleTest || undefined
      });
    } catch (err) {
      console.error('Connection test failed:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">اختبار الاتصال بالـ API</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <p className="text-sm text-gray-700">
          <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7065'}
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
        </p>
      </div>

      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? 'جاري الاختبار...' : 'اختبر الاتصال'}
      </button>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded p-4">
          <h3 className="text-red-800 font-semibold mb-2">فشل الاتصال</h3>
          <p className="text-red-600 text-sm font-mono">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
          <h3 className="text-green-800 font-semibold mb-2">✅ الاتصال ناجح</h3>
          <pre className="text-sm bg-white p-3 rounded overflow-auto" dir="ltr">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
