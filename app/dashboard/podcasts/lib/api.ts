import axios from 'axios';
import { Podcast, CreatePodcastDto, UpdatePodcastDto } from '../types/Podcast';
import { getApiUrl } from '../../../../lib/api-config';
import { getToken } from '../../../../lib/auth';

const BASE_API_URL = getApiUrl();
const API_URL = `${BASE_API_URL}/api/Podcasts`;

// Create axios instance
const api = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
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

// Get all podcasts
export const getPodcasts = async (): Promise<Podcast[]> => {
  try {
    const response = await api.get<Podcast[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    throw error;
  }
};

// Get podcast by ID
export const getPodcast = async (id: number): Promise<Podcast> => {
  try {
    const response = await api.get<Podcast>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching podcast:', error);
    throw error;
  }
};

// Create podcast
export const createPodcast = async (podcastData: CreatePodcastDto): Promise<Podcast> => {
  try {
    const response = await api.post<Podcast>(API_URL, podcastData);
    return response.data;
  } catch (error) {
    console.error('Error creating podcast:', error);
    throw error;
  }
};

// Update podcast
export const updatePodcast = async (id: number, podcastData: UpdatePodcastDto): Promise<void> => {
  try {
    await api.put(`${API_URL}/${id}`, podcastData);
  } catch (error) {
    console.error('Error updating podcast:', error);
    throw error;
  }
};

// Delete podcast
export const deletePodcast = async (id: number): Promise<void> => {
  try {
    await api.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting podcast:', error);
    throw error;
  }
};
