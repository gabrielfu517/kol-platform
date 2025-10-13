import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface KOL {
  id: number;
  name: string;
  email: string;
  category: string;
  platform: string;
  followers: number;
  engagement_rate: number;
  bio: string;
  profile_image?: string;
  price_per_post: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  budget: number;
  start_date?: string;
  end_date?: string;
  status: string;
  kol_id?: number;
  kol?: KOL;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// Auth
export const authAPI = {
  register: (data: { email: string; password: string; full_name: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// KOLs
export const kolAPI = {
  getAll: (params?: any) => api.get<KOL[]>('/kols', { params }),
  getOne: (id: number) => api.get<KOL>(`/kols/${id}`),
  create: (data: Partial<KOL>) => api.post<KOL>('/kols', data),
  update: (id: number, data: Partial<KOL>) => api.put<KOL>(`/kols/${id}`, data),
  delete: (id: number) => api.delete(`/kols/${id}`),
};

// Campaigns
export const campaignAPI = {
  getAll: () => api.get<Campaign[]>('/campaigns'),
  getOne: (id: number) => api.get<Campaign>(`/campaigns/${id}`),
  create: (data: Partial<Campaign>) => api.post<Campaign>('/campaigns', data),
  update: (id: number, data: Partial<Campaign>) => api.put<Campaign>(`/campaigns/${id}`, data),
  delete: (id: number) => api.delete(`/campaigns/${id}`),
};

// Stats
export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export default api;

