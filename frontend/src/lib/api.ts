import axios from 'axios';

import type { Garment, GarmentCategory, GarmentFilter } from '@/types/garment';
import type { Outfit, OutfitCreatePayload } from '@/types/outfit';
import type { TryOnResult, GarmentType } from '@/types/ar';
import type { User } from '@/types/user';
import { useUserStore } from '@/store/useUserStore';
import { demoGarments } from './demoGarments';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const session = useUserStore.getState().session;
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useUserStore.getState().signOut();
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  },
);

function buildQuery(filter?: GarmentFilter): string {
  if (!filter) {
    return '';
  }

  const params = new URLSearchParams();
  if (filter.category && filter.category !== 'ALL') {
    params.set('category', filter.category);
  }
  if (filter.query) {
    params.set('query', filter.query);
  }
  if (typeof filter.isCustomDesign === 'boolean') {
    params.set('isCustomDesign', String(filter.isCustomDesign));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

function matchesFilter(garment: Garment, filter?: GarmentFilter): boolean {
  if (!filter) {
    return true;
  }

  if (filter.category && filter.category !== 'ALL' && garment.category !== filter.category) {
    return false;
  }

  if (typeof filter.isCustomDesign === 'boolean' && garment.isCustomDesign !== filter.isCustomDesign) {
    return false;
  }

  if (filter.query) {
    const query = filter.query.toLowerCase();
    const haystack = [garment.name, garment.brand ?? '', garment.category].join(' ').toLowerCase();
    if (!haystack.includes(query)) {
      return false;
    }
  }

  return true;
}

export const garmentApi = {
  async getAll(filter?: GarmentFilter): Promise<Garment[]> {
    try {
      const { data } = await api.get<{ items: Garment[] }>('/api/garments');
      const merged = [...demoGarments, ...data.items].filter((garment) => matchesFilter(garment, filter));
      return Array.from(new Map(merged.map((garment) => [garment.id, garment])).values());
    } catch {
      return demoGarments.filter((garment) => matchesFilter(garment, filter));
    }
  },
  async getById(id: string): Promise<Garment> {
    const { data } = await api.get<Garment>(`/api/garments/${id}`);
    return data;
  },
  async upload(file: File, name: string, category: GarmentCategory, uploadedBy = 'Anonymous'): Promise<Garment> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('uploadedBy', uploadedBy);
    const { data } = await api.post<Garment>('/api/garments/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async upload3D(modelFile: File, thumbnailFile: File, name: string, category: GarmentCategory, uploadedBy = 'Anonymous'): Promise<Garment> {
    const formData = new FormData();
    formData.append('model', modelFile);
    formData.append('image', thumbnailFile);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('uploadedBy', uploadedBy);
    const { data } = await api.post<Garment>('/api/garments/upload-3d', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/api/garments/${id}`);
  },
};

export const sessionApi = {
  async create(payload: { garmentId?: string; deviceType?: string; source?: string }): Promise<{ sessionId: string; status: string; createdAt: string }> {
    const { data } = await api.post<{ sessionId: string; status: string; createdAt: string }>('/session', payload);
    return data;
  },
};

export const feedbackApi = {
  async submit(payload: { sessionId: string; garmentId?: string; rating: number; comment?: string }): Promise<{ status: string; feedbackCount: number; createdAt: string }> {
    const { data } = await api.post<{ status: string; feedbackCount: number; createdAt: string }>('/feedback', payload);
    return data;
  },
};

export const tryOnApi = {
  async run(personBlob: Blob, garmentId: string, type: GarmentType): Promise<TryOnResult> {
    const formData = new FormData();
    formData.append('person_image', personBlob, 'person.jpg');
    formData.append('garment_id', garmentId);
    formData.append('garment_type', type);
    const { data } = await api.post<TryOnResult>('/api/tryon/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async submitFeedback(sessionId: string, rating: number): Promise<void> {
    await api.post(`/api/tryon/${sessionId}/feedback`, { session_id: sessionId, rating });
  },
};

export const outfitApi = {
  async getAll(): Promise<Outfit[]> {
    const { data } = await api.get<{ items: Outfit[] }>('/api/outfits/');
    return data.items;
  },
  async create(name: string, garmentIds: string[]): Promise<Outfit> {
    const payload: OutfitCreatePayload = { name, garmentIds };
    const { data } = await api.post<Outfit>('/api/outfits/', payload);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/api/outfits/${id}`);
  },
};

export const userApi = {
  async register(email: string, password: string, name: string): Promise<User> {
    const { data } = await api.post<{ user: User }>('/api/auth/register', { email, password, name });
    return data.user;
  },
  async login(email: string, password: string): Promise<User> {
    const { data } = await api.post<{ user: User }>('/api/auth/login', { email, password });
    return data.user;
  },
  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },
  async getProfile(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/api/auth/me');
    return data.user;
  },
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/api/users/me', data);
    return response.data;
  },
};

export default api;
