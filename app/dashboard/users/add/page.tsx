'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getApiEndpoint } from '@/lib/api-config';
import { getToken } from '@/lib/auth';

const ROLES = [
  { value: 'Admin',       label: 'مدير — Admin' },
  { value: 'Editor',      label: 'محرر — Editor' },
  { value: 'ProofReader', label: 'مدقق — ProofReader' },
  { value: 'Publisher',   label: 'ناشر — Publisher' },
];

export default function AddUser() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Editor',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    if (form.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(getApiEndpoint('/api/Users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.message || data?.errors?.join(', ') || 'فشل إنشاء المستخدم';
        toast.error(msg);
        return;
      }
      toast.success('تم إنشاء المستخدم بنجاح');
      router.push('/dashboard/users');
    } catch {
      toast.error('تعذر الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  const field = (
    id: string,
    label: string,
    type: string,
    key: keyof typeof form
  ) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
        required
      />
    </div>
  );

  return (
    <div dir="rtl" className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إضافة مستخدم جديد</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">
          ← رجوع
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field('firstName', 'الاسم الأول *', 'text', 'firstName')}
          {field('lastName', 'الاسم الأخير *', 'text', 'lastName')}
        </div>

        {field('email', 'البريد الإلكتروني *', 'email', 'email')}

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            الدور *
          </label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field('password', 'كلمة المرور *', 'password', 'password')}
          {field('confirmPassword', 'تأكيد كلمة المرور *', 'password', 'confirmPassword')}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-60"
          >
            {saving ? 'جارٍ الحفظ...' : 'إنشاء المستخدم'}
          </button>
        </div>
      </form>
    </div>
  );
}
