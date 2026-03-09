import { getApiUrl } from '../../../../lib/api-config';
import { AboutUs, CreateAboutUsDto, UpdateAboutUsDto } from '../types/AboutUs';

const BASE_API_URL = getApiUrl();
const API_URL = `${BASE_API_URL}/api/AboutUs`;

export const getAboutUsList = async (): Promise<AboutUs[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch about us list:', error);
    throw error;
  }
};

export const getAboutUsById = async (id: number): Promise<AboutUs> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch about us:', error);
    throw error;
  }
};

export const createAboutUs = async (data: CreateAboutUsDto): Promise<AboutUs> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create about us:', error);
    throw error;
  }
};

export const updateAboutUs = async (id: number, data: UpdateAboutUsDto): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to update about us:', error);
    throw error;
  }
};

export const deleteAboutUs = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete about us:', error);
    throw error;
  }
};
