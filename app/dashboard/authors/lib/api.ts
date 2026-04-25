import { getApiUrl } from '../../../../lib/api-config';
import { Author, CreateAuthorDto, UpdateAuthorDto } from '../types/Author';

const BASE_API_URL = getApiUrl();

export async function getAuthors(): Promise<Author[]> {
  const res = await fetch(`${BASE_API_URL}/api/Authors`, { cache: 'no-store' });
  if (!res.ok) throw new Error('فشل في جلب الكتّاب');
  return res.json();
}

export async function getAuthor(id: number): Promise<Author> {
  const res = await fetch(`${BASE_API_URL}/api/Authors/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('فشل في جلب بيانات الكاتب');
  return res.json();
}

export async function createAuthor(data: CreateAuthorDto): Promise<Author> {
  const formData = new FormData();
  formData.append('fullName', data.fullName);
  if (data.bio) formData.append('bio', data.bio);
  if (data.profilePicture) formData.append('profilePicture', data.profilePicture);

  const res = await fetch(`${BASE_API_URL}/api/Authors`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('فشل في إنشاء الكاتب');
  return res.json();
}

export async function updateAuthor(id: number, data: UpdateAuthorDto): Promise<Author> {
  const formData = new FormData();
  if (data.fullName) formData.append('fullName', data.fullName);
  if (data.bio !== undefined) formData.append('bio', data.bio ?? '');
  if (data.profilePicture) formData.append('profilePicture', data.profilePicture);

  const res = await fetch(`${BASE_API_URL}/api/Authors/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) throw new Error('فشل في تحديث الكاتب');
  return res.json();
}

export async function deleteAuthor(id: number): Promise<void> {
  const res = await fetch(`${BASE_API_URL}/api/Authors/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('فشل في حذف الكاتب');
}
