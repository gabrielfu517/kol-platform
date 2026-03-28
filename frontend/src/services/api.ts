import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL as string) || '/api';

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

export interface Job {
  id: number;
  owner_user_id: number;
  title: string;
  description?: string;
  budget: number;
  restaurant_name?: string;
  address?: string;
  will_pay: boolean;
  suggested_turnaround_days?: number;
  restrictions: string[];
  content_types: string[];
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface JobAssignment {
  id: number;
  job_id: number;
  kol_id: number;
  invite_status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  invited_at?: string;
  responded_at?: string;
  note?: string;
  job?: Job;
  kol?: KOL;
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

// Jobs (owner/admin)
export const jobsAPI = {
  list: () => api.get<Job[]>('/jobs'),
  get: (id: number) => api.get<Job & { assignments: JobAssignment[] }>(`/jobs/${id}`),
  create: (data: Partial<Job> & { content_types: string[]; restrictions?: string[] }) =>
    api.post<Job>('/jobs', data),
  update: (id: number, data: Partial<Job> & { content_types?: string[]; restrictions?: string[] }) =>
    api.put<Job>(`/jobs/${id}`, data),
  remove: (id: number) => api.delete(`/jobs/${id}`),
  publish: (id: number) => api.post<Job>(`/jobs/${id}/publish`, {}),
  close: (id: number) => api.post<Job>(`/jobs/${id}/close`, {}),
  inviteKOLs: (id: number, kolIds: number[]) => api.post<{ created: number }>(`/jobs/${id}/invites`, { kol_ids: kolIds }),
  withdrawInvite: (id: number, kolId: number) =>
    api.post<JobAssignment>(`/jobs/${id}/invites/${kolId}/withdraw`, {}),
};

// KOL-facing
export const myJobsAPI = {
  list: (status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn') =>
    api.get<JobAssignment[]>('/my-jobs', { params: { status } }),
  accept: (assignmentId: number) => api.post<JobAssignment>(`/my-jobs/${assignmentId}/accept`, {}),
  reject: (assignmentId: number) => api.post<JobAssignment>(`/my-jobs/${assignmentId}/reject`, {}),
};

// Stats
export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export default api;

