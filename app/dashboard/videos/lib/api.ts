import axios from 'axios';
import { Video, CreateVideoDto, UpdateVideoDto } from '../types/Video';
import { getApiUrl } from '../../../../lib/api-config';

const BASE_API_URL = getApiUrl();
const API_URL = `${BASE_API_URL}/api/Videos`;

// Create axios instance
const api = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: false
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

// Get all videos
export const getVideos = async (): Promise<Video[]> => {
  try {
    const response = await api.get<Video[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Get video by ID
export const getVideo = async (id: number): Promise<Video> => {
  try {
    const response = await api.get<Video>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

// Create video
export const createVideo = async (videoData: CreateVideoDto): Promise<Video> => {
  try {
    const response = await api.post<Video>(API_URL, videoData);
    return response.data;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
};

// Update video
export const updateVideo = async (id: number, videoData: UpdateVideoDto): Promise<void> => {
  try {
    await api.put(`${API_URL}/${id}`, videoData);
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

// Delete video
export const deleteVideo = async (id: number): Promise<void> => {
  try {
    await api.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};
