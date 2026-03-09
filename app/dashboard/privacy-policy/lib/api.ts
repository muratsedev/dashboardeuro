import { getApiUrl } from '../../../../lib/api-config';
import { PrivacyPolicy, CreatePrivacyPolicyDto, UpdatePrivacyPolicyDto } from '../types/PrivacyPolicy';

const BASE_API_URL = getApiUrl();
const API_URL = `${BASE_API_URL}/api/PrivacyPolicies`;

export const getPrivacyPoliciesList = async (): Promise<PrivacyPolicy[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch privacy policies list:', error);
    throw error;
  }
};

export const getPrivacyPolicyById = async (id: number): Promise<PrivacyPolicy> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch privacy policy:', error);
    throw error;
  }
};

export const createPrivacyPolicy = async (data: CreatePrivacyPolicyDto): Promise<PrivacyPolicy> => {
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
    console.error('Failed to create privacy policy:', error);
    throw error;
  }
};

export const updatePrivacyPolicy = async (id: number, data: CreatePrivacyPolicyDto): Promise<PrivacyPolicy> => {
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
      return { id, ...data, createdDate: new Date().toISOString(), modifiedDate: new Date().toISOString() } as PrivacyPolicy;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update privacy policy:', error);
    throw error;
  }
};

export const deletePrivacyPolicy = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete privacy policy:', error);
    throw error;
  }
};
