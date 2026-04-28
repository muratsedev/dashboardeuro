import { getApiUrl } from '../../../../lib/api-config';
import { getToken } from '../../../../lib/auth';
import { Opinion, OpinionCreate } from '../types/Opinion';

const BASE_API_URL = getApiUrl();
const API_URL = `${BASE_API_URL}/api/Opinions`;

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getOpinions(): Promise<Opinion[]> {
  const res = await fetch(API_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('فشل في جلب المقالات');
  return res.json();
}

export async function getOpinion(id: string): Promise<Opinion> {
  const res = await fetch(`${API_URL}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('فشل في جلب المقال');
  return res.json();
}

export async function createOpinion(data: OpinionCreate, image?: File): Promise<Opinion> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('summary', data.summary);
  formData.append('content', data.content);
  formData.append('isPublished', data.isPublished.toString());
  if (data.authorId) formData.append('authorId', data.authorId.toString());
  if (data.tagId) formData.append('tagId', data.tagId.toString());
  if (data.createdDate) formData.append('createdDate', data.createdDate);
  if (image) formData.append('image', image, image.name);

  const res = await fetch(API_URL, { method: 'POST', body: formData, headers: authHeaders() });
  if (!res.ok) throw new Error('فشل في إنشاء المقال');
  return res.json();
}

export async function updateOpinion(id: string, data: OpinionCreate, image?: File): Promise<void> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('summary', data.summary);
  formData.append('content', data.content);
  formData.append('isPublished', data.isPublished.toString());
  if (data.authorId !== undefined) formData.append('authorId', data.authorId.toString());
  if (data.tagId !== undefined) formData.append('tagId', data.tagId.toString());
  if (data.updatedDate) formData.append('updatedDate', data.updatedDate);
  if (image) formData.append('image', image, image.name);

  const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', body: formData, headers: authHeaders() });
  if (!res.ok) throw new Error('فشل في تحديث المقال');
}

export async function deleteOpinion(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('فشل في حذف المقال');
}

export async function getAuthors(): Promise<{ id: number; fullName: string | null }[]> {
  const res = await fetch(`${BASE_API_URL}/api/Authors`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function getTags(): Promise<{ tagId: number; tagName: string }[]> {
  const res = await fetch(`${BASE_API_URL}/api/Tags`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}
