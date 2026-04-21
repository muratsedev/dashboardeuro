import { getApiUrl } from '../../../../lib/api-config';
import { TermsOfUse, CreateTermsOfUseDto } from '../types/TermsOfUse';

const BASE_API_URL = getApiUrl();
const API_URL = `${BASE_API_URL}/api/TermsOfUse`;

export const getTermsOfUseList = async (): Promise<TermsOfUse[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch terms of use list:', error);
    throw error;
  }
};

export const getTermsOfUseById = async (id: number): Promise<TermsOfUse> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch terms of use:', error);
    throw error;
  }
};

export const createTermsOfUse = async (data: CreateTermsOfUseDto): Promise<TermsOfUse> => {
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
    console.error('Failed to create terms of use:', error);
    throw error;
  }
};

export const updateTermsOfUse = async (id: number, data: CreateTermsOfUseDto): Promise<TermsOfUse> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...data,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content response
    if (response.status === 204) {
      // Return the updated data since backend doesn't return it
      return { id, ...data, createdDate: new Date().toISOString(), modifiedDate: new Date().toISOString() } as TermsOfUse;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update terms of use:', error);
    throw error;
  }
};

export const deleteTermsOfUse = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete terms of use:', error);
    throw error;
  }
};
