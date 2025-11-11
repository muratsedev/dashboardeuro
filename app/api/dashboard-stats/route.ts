import { NextResponse } from 'next/server';
import axios from 'axios';

interface Article {
  id: string;
  isPublished: boolean;
  createdDate: string;
  editorChoice?: boolean;
}

// Configure axios instance with timeout and error handling
const axiosInstance = axios.create({
  timeout: 10000,
  validateStatus: () => true // Accept all status codes
});

// Get the API URL from environment variable or default
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_API_URL || 'https://eennback-002-site1.atempurl.com';
  }
  // Client-side
  return process.env.NEXT_PUBLIC_API_URL || 'https://eennback-002-site1.atempurl.com';
};

const BASE_API_URL = getApiUrl();

export async function GET() {
  try {
    console.log('=== Dashboard Stats API Called ===');
    console.log('BASE_API_URL:', BASE_API_URL);

    // Fetch all required data in parallel with individual error handling
    const [articlesRes, categoriesRes, breakingNewsRes, editorChoiceRes] = await Promise.allSettled([
      axiosInstance.get(`${BASE_API_URL}/api/Articles`),
      axiosInstance.get(`${BASE_API_URL}/api/Categories`),
      axiosInstance.get(`${BASE_API_URL}/api/BreakingNews`),
      axiosInstance.get(`${BASE_API_URL}/api/Articles/EditorChoice`)
    ]);

    const articles = articlesRes.status === 'fulfilled' ? articlesRes.value.data : [];
    const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : [];
    const breakingNews = breakingNewsRes.status === 'fulfilled' ? breakingNewsRes.value.data : [];
    const editorChoiceArticles = editorChoiceRes.status === 'fulfilled' ? editorChoiceRes.value.data : [];

    console.log('EditorChoice Response Status:', editorChoiceRes.status);
    if (editorChoiceRes.status === 'rejected') {
      console.error('EditorChoice Error:', editorChoiceRes.reason);
    } else {
      console.log('EditorChoice Data:', editorChoiceArticles);
    }

    // Calculate statistics
    const totalArticles = Array.isArray(articles) ? articles.length : 0;
    const totalCategories = Array.isArray(categories) ? categories.length : 0;
    const totalBreakingNews = Array.isArray(breakingNews) ? breakingNews.length : 0;
    const publishedArticles = Array.isArray(articles) ? articles.filter((article: Article) => article.isPublished).length : 0;
    
    // Calculate recent articles (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentArticles = Array.isArray(articles) ? articles.filter((article: Article) => {
      const createdDate = new Date(article.createdDate);
      return createdDate >= thirtyDaysAgo;
    }).length : 0;

    const totalEditorChoice = Array.isArray(editorChoiceArticles) ? editorChoiceArticles.length : 0;

    console.log('Dashboard Stats:', {
      totalArticles,
      totalCategories,
      totalBreakingNews,
      publishedArticles,
      recentArticles,
      editorChoiceArticles: totalEditorChoice
    });

    return NextResponse.json({
      totalArticles,
      totalCategories,
      totalBreakingNews,
      publishedArticles,
      recentArticles,
      editorChoiceArticles: totalEditorChoice
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard statistics',
        totalArticles: 0,
        totalCategories: 0,
        totalBreakingNews: 0,
        publishedArticles: 0,
        recentArticles: 0,
        editorChoiceArticles: 0
      },
      { status: 500 }
    );
  }
}
