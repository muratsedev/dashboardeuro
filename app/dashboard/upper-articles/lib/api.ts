import axios from 'axios';
import { UpperArticle, CreateUpperArticleDto, UpdateUpperArticleDto } from '../types/UpperArticle';
import { getApiUrl } from '../../../../lib/api-config';
import { getToken } from '../../../../lib/auth';

// Configure axios for HTTPS development with self-signed certificates
if (typeof window === 'undefined') {
  // Server-side configuration - only for development
  if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}

const BASE_API_URL = getApiUrl();
const UpperArticles_API_URL = `${BASE_API_URL}/api/UpperArticles`;

// Create axios instance with auth interceptor
const api = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// UpperArticles API Functions
export const getUpperArticles = async (): Promise<UpperArticle[]> => {
  try {
    const response = await api.get(UpperArticles_API_URL);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const getUpperArticle = async (id: number): Promise<UpperArticle> => {
  try {
    const response = await api.get(`${UpperArticles_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const createUpperArticle = async (upperArticleData: CreateUpperArticleDto): Promise<UpperArticle> => {
  try {
    const response = await api.post(UpperArticles_API_URL, upperArticleData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const updateUpperArticle = async (id: number, upperArticleData: UpdateUpperArticleDto): Promise<void> => {
  try {
    await api.put(`${UpperArticles_API_URL}/${id}`, upperArticleData);
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
    await api.delete(`${UpperArticles_API_URL}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};
