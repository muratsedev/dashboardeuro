import axios from 'axios';
import { ArticleAll, ArticleCreate } from '../types/Article';
import { CategoryAll } from '../types/Category';
import { Tag, CreateTagDto, UpdateTagDto } from '../types/Tag';
import { PodcastType } from '../types/PodcastType';
import { UpperArticle, CreateUpperArticleDto, UpdateUpperArticleDto } from '../../upper-articles/types/UpperArticle';
import { getToken } from '../../../../lib/auth';

// Configure axios for HTTPS development with self-signed certificates
if (typeof window === 'undefined') {
  // Server-side configuration - only for development
  if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}

// Create axios instance with better error handling
const api = axios.create({
  timeout: 30000, // Increased timeout for slower connections
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  // Allow credentials for CORS
  withCredentials: false
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.status, error.config?.url);
    }
    return Promise.reject(error);
  }
);

import { getApiUrl } from '../../../../lib/api-config';

const BASE_API_URL = getApiUrl();
const API_URL = `${BASE_API_URL}/api/Articles`;
const Categories_API_URL = `${BASE_API_URL}/api/Categories`;
const Tags_API_URL = `${BASE_API_URL}/api/Tags`;
const PodcastTypes_API_URL = `${BASE_API_URL}/api/Podcasts`;
const UpperArticles_API_URL = `${BASE_API_URL}/api/UpperArticles`;

export const updateArticle = async (id: string, articleData: ArticleCreate, file?: File): Promise<ArticleAll> => {
  try {
    const formData = new FormData();
    
    // Append basic article data
    formData.append('articleTitle', articleData.articleTitle);
    formData.append('articleSummary', articleData.articleSummary);
    formData.append('articleContent', articleData.articleContent);
    formData.append('content', articleData.content || '');
    formData.append('categoryId', articleData.categoryId.id.toString());
    
    // Append additional fields if they exist in ArticleCreate
    if (articleData.isPublished !== undefined) {
      formData.append('isPublished', articleData.isPublished.toString());
    }
    if (articleData.editorChoice !== undefined) {
      formData.append('editorChoice', articleData.editorChoice.toString());
    }
    if (articleData.facebook !== undefined) {
      formData.append('facebook', articleData.facebook.toString());
    }
    if (articleData.twitter !== undefined) {
      formData.append('twitter', articleData.twitter.toString());
    }
    if (articleData.tagId !== undefined) {
      formData.append('tagId', articleData.tagId.toString());
    }
    if (articleData.podcastTypeId !== undefined) {
      formData.append('podcastTypeId', articleData.podcastTypeId.toString());
    }
    
    // Always send upperArticleId (0 means no assignment/remove assignment)
    const upperArticleIdValue = articleData.upperArticleId ?? 0;
    formData.append('upperArticleId', upperArticleIdValue.toString());
    
    if (articleData.createdDate) {
      formData.append('createdDate', articleData.createdDate.toISOString());
    }

    // Append image file if it exists
    if (file) {
      formData.append('Image', file, file.name);
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    
    if (!responseText.trim()) {
      return {} as ArticleAll;
    }
    
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch {
      if (response.status >= 200 && response.status < 300) {
        return {} as ArticleAll;
      }
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    throw error;
  }
};

export const createArticle = async (articleData: ArticleCreate, file?: File): Promise<ArticleAll> => {
  try {
    // Validate required fields
    if (!articleData.articleTitle?.trim()) {
      throw new Error('Article title is required');
    }
    if (!articleData.articleSummary?.trim()) {
      throw new Error('Article summary is required');
    }
    if (!articleData.articleContent?.trim()) {
      throw new Error('Article content is required');
    }
    if (!articleData.categoryId?.id) {
      throw new Error('Category ID is required');
    }

    // Check if category exists
    let categoryResponse;
    try {
      categoryResponse = await axios.get(`${Categories_API_URL}/${articleData.categoryId.id}`);
      if (!categoryResponse.data) {
        throw new Error('Category not found');
      }
    } catch {
      throw new Error(`Category with ID ${articleData.categoryId.id} not found`);
    }

    // Create FormData for multipart/form-data submission
    const formData = new FormData();
    
    formData.append('articleTitle', articleData.articleTitle);
    formData.append('articleSummary', articleData.articleSummary);
    formData.append('articleContent', articleData.articleContent);
    formData.append('categoryId', articleData.categoryId.id.toString());
    
    // Append additional fields if they exist in ArticleCreate
    if (articleData.isPublished !== undefined) {
      formData.append('isPublished', articleData.isPublished.toString());
    }
    if (articleData.editorChoice !== undefined) {
      formData.append('editorChoice', articleData.editorChoice.toString());
    }
    if (articleData.facebook !== undefined) {
      formData.append('facebook', articleData.facebook.toString());
    }
    if (articleData.twitter !== undefined) {
      formData.append('twitter', articleData.twitter.toString());
    }
    if (articleData.tagId !== undefined) {
      formData.append('tagId', articleData.tagId.toString());
    }
    if (articleData.podcastTypeId !== undefined) {
      formData.append('podcastTypeId', articleData.podcastTypeId.toString());
    }
    
    const upperArticleIdValue = articleData.upperArticleId ?? 0;
    formData.append('upperArticleId', upperArticleIdValue.toString());
    
    const now = new Date().toISOString();
    formData.append('createdDate', articleData.createdDate ? articleData.createdDate.toISOString() : now);
    formData.append('updatedDate', now);

    if (file) {
      formData.append('Image', file, file.name);
    }

    const response = await axios.post<ArticleAll>(API_URL, formData, {
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: (status) => status < 500
    });

    if (response.status >= 400) {
      throw new Error(`Server error: ${response.status} - ${JSON.stringify(response.data)}`);
    }

    // Return the response data as is since backend returns proper format
    return {
      ...response.data,
      category: {
        id: categoryResponse.data.id,
        name: categoryResponse.data.name
      }
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      let errorMessage = 'فشل في إنشاء المقال';
      
      if (error.response?.status === 400) {
        errorMessage = 'خطأ في البيانات المرسلة - يرجى التحقق من جميع الحقول المطلوبة';
      } else if (error.response?.status === 409) {
        errorMessage = 'المقال العلوي محجوز بالفعل لمقال آخر';
      }
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        } else if (error.response.data.errors) {
          const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
          errorMessage = `خطأ في التحقق: ${validationErrors}`;
        } else if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getArticles = async (): Promise<ArticleAll[]> => {
  try {
    const response = await api.get(API_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Accept': 'application/json'
      },
      params: {
        _t: Date.now()
      }
    });
    
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format: expected array of articles');
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch articles';
      throw new Error(`فشل في الاتصال بالخادم: ${errorMessage}`);
    }
    throw error;
  }
};

export const getArticle = async (id: string): Promise<ArticleAll> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const getEditorChoice = async (): Promise<ArticleAll[]> => {
  try {
    const response = await api.get(`${API_URL}/EditorChoice`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Accept': 'application/json'
      },
      params: {
        _t: Date.now()
      }
    });
    
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format: expected array of articles');
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch editor choice articles';
      throw new Error(`فشل في الاتصال بالخادم: ${errorMessage}`);
    }
    throw error;
  }
};

export const createTodo = async (data: { articleTitle: string; categoryId: number }): Promise<ArticleAll> => {
  try {
    // Validate category existence before proceeding
    const categoryResponse = await axios.get(`${Categories_API_URL}/${data.categoryId}`);
    if (!categoryResponse.data || !categoryResponse.data.name) {
      throw new Error('Category does not exist');
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('articleTitle', data.articleTitle);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('content', '');  // Optional: Add default content if needed
    formData.append('excerpt', data.articleTitle.substring(0, 100));  // Optional: Generate excerpt from title

    const response = await axios.post<ArticleAll>(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    // Return formatted response with category information
    return {
      id: response.data.id,
      articleTitle: response.data.articleTitle,
      articleSummary: response.data.articleSummary,
      articleContent: response.data.articleContent,
      imagePath: response.data.imagePath,
      isPublished: response.data.isPublished,
      facebook: response.data.facebook,
      twitter: response.data.twitter,
      createdDate: response.data.createdDate,
      updatedDate: response.data.updatedDate,
      categoryId: Number(response.data.categoryId),
      categoryName: response.data.categoryName,
      tagId: response.data.tagId,
      podcastTypeId: response.data.podcastTypeId,
      upperArticleId: response.data.upperArticleId,
      category: {
        id: categoryResponse.data.id,
        name: categoryResponse.data.name
      }
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw new Error(error.response?.data?.message || 'Failed to create article');
    }
    throw error;
  }
};
export const createCategory = async (todo: Omit<CategoryAll, 'id' |'categorySlug'>): Promise<CategoryAll> => {
  const response = await axios.post(Categories_API_URL, todo);
  return response.data;
}

// Add these new functions
export const getCategories = async (): Promise<CategoryAll[]> => {
  try {
    const response = await api.get(Categories_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const updateCategory = async (id: number, categoryData: Partial<CategoryAll>): Promise<CategoryAll> => {
  try {
    const payload = {
      ...categoryData,
      id: id // Ensure ID is included in the request
    };
    console.log('=== Update Category API Call ===');
    console.log('Category ID:', id);
    console.log('Payload:', payload);
    console.log('IsActivated in payload:', payload.isActivated);
    console.log('IsShowInFooter in payload:', payload.isShowInFooter);
    
    const response = await axios.put(`${Categories_API_URL}/${id}`, payload);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Response:', error.response?.data);
      console.error('API Error Status:', error.response?.status);
    }
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  await axios.delete(`${Categories_API_URL}/${id}`);
};

export const getArticlesByCategory = async (categoryId: number): Promise<ArticleAll[]> => {
  try {
    const response = await axios.get(`${API_URL}/category/${categoryId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('خطأ في جلب المقالات:', error.response?.data);
      throw new Error('فشل في جلب المقالات للتصنيف المحدد');
    }
    throw error;
  }
};

// Tags API Functions
export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get(Tags_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const getTag = async (id: number): Promise<Tag> => {
  try {
    const response = await axios.get(`${Tags_API_URL}/${id}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const createTag = async (tagData: CreateTagDto): Promise<Tag> => {
  try {
    const response = await axios.post(Tags_API_URL, tagData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const updateTag = async (id: number, tagData: UpdateTagDto): Promise<void> => {
  try {
    await axios.put(`${Tags_API_URL}/${id}`, tagData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const deleteTag = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${Tags_API_URL}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

// PodcastTypes API Functions
export const getPodcastTypes = async (): Promise<PodcastType[]> => {
  try {
    const response = await api.get(PodcastTypes_API_URL);
    const items = Array.isArray(response.data) ? response.data : [];

    // Backend returns podcastTitle/podcastLink while UI expects podcastName.
    return items.map((item: any) => ({
      podcastId: item.podcastId,
      podcastName: item.podcastName ?? item.podcastTitle ?? '',
      podcastLink: item.podcastLink,
      isPublished: item.isPublished,
    }));
  } catch (error) {
    console.error('Error fetching podcast types:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

// UpperArticles API Functions
export const getUpperArticles = async (): Promise<UpperArticle[]> => {
  try {
    const response = await api.get(UpperArticles_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching upper articles:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const getAvailableUpperArticles = async (excludeArticleId?: string): Promise<UpperArticle[]> => {
  try {
    // Try the new Available endpoint first
    const params = excludeArticleId ? { excludeArticleId } : {};
    
    const response = await axios.get(`${UpperArticles_API_URL}/Available`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      params
    });
    return response.data;
  } catch (error) {
    console.warn('Available endpoint failed, falling back to client-side filtering:', error);
    
    // Fallback to client-side filtering if the Available endpoint fails
    try {
      // Get all upper articles
      const allUpperArticles = await getUpperArticles();
      
      // Get all articles to check which upper articles are already in use
      const allArticles = await getArticles();
      
      // Find upper articles that are not linked to any article (or excluding specific article)
      const usedUpperArticleIds = allArticles
        .filter(article => 
          article.upperArticleId && 
          (!excludeArticleId || article.id !== excludeArticleId)
        )
        .map(article => article.upperArticleId);
      
      // Return only unused upper articles
      return allUpperArticles.filter(upperArticle => 
        !usedUpperArticleIds.includes(upperArticle.upperArticleId)
      );
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
      if (axios.isAxiosError(fallbackError)) {
        console.error('API Error:', fallbackError.response?.data);
        console.error('Status:', fallbackError.response?.status);
      }
      throw fallbackError;
    }
  }
};

export const getUpperArticleById = async (id: number): Promise<UpperArticle> => {
  try {
    const response = await axios.get(`${UpperArticles_API_URL}/${id}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const createUpperArticle = async (upperArticle: CreateUpperArticleDto): Promise<UpperArticle> => {
  try {
    const response = await axios.post(UpperArticles_API_URL, upperArticle, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const updateUpperArticle = async (id: number, upperArticle: UpdateUpperArticleDto): Promise<UpperArticle> => {
  try {
    const response = await axios.put(`${UpperArticles_API_URL}/${id}`, upperArticle, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const deleteUpperArticle = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${UpperArticles_API_URL}/${id}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};
