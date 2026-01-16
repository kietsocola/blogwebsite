import axios, { AxiosError } from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  Post,
  PostRequest,
  Category,
  CategoryRequest,
  Tag,
  PageResponse,
  Stats,
  User,
  ApiError
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};

// Posts
export const postsApi = {
  getAll: async (page = 0): Promise<PageResponse<Post>> => {
    const response = await api.get<PageResponse<Post>>(`/posts?page=${page}`);
    return response.data;
  },
  
  getBySlug: async (slug: string): Promise<Post> => {
    const response = await api.get<Post>(`/posts/${slug}`);
    return response.data;
  },
  
  getMy: async (page = 0, status?: string): Promise<PageResponse<Post>> => {
    let url = `/posts/my?page=${page}`;
    if (status) url += `&status=${status}`;
    const response = await api.get<PageResponse<Post>>(url);
    return response.data;
  },
  
  search: async (q: string, page = 0): Promise<PageResponse<Post>> => {
    const response = await api.get<PageResponse<Post>>(`/posts/search?q=${q}&page=${page}`);
    return response.data;
  },
  
  create: async (data: PostRequest): Promise<Post> => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },
  
  update: async (id: number, data: PostRequest): Promise<Post> => {
    const response = await api.put<Post>(`/posts/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },
};

// Categories
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  
  getPosts: async (slug: string, page = 0): Promise<PageResponse<Post>> => {
    const response = await api.get<PageResponse<Post>>(`/categories/${slug}/posts?page=${page}`);
    return response.data;
  },
  
  create: async (data: CategoryRequest): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },
  
  update: async (id: number, data: CategoryRequest): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Tags
export const tagsApi = {
  getAll: async (): Promise<Tag[]> => {
    const response = await api.get<Tag[]>('/tags');
    return response.data;
  },
  
  getPosts: async (slug: string, page = 0): Promise<PageResponse<Post>> => {
    const response = await api.get<PageResponse<Post>>(`/tags/${slug}/posts?page=${page}`);
    return response.data;
  },
};

// Admin
export const adminApi = {
  getStats: async (): Promise<Stats> => {
    const response = await api.get<Stats>('/admin/stats');
    return response.data;
  },
  
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },
  
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
  
  getAllPosts: async (page = 0, status?: string): Promise<PageResponse<Post>> => {
    let url = `/admin/posts?page=${page}`;
    if (status) url += `&status=${status}`;
    const response = await api.get<PageResponse<Post>>(url);
    return response.data;
  },
  
  approvePost: async (id: number): Promise<Post> => {
    const response = await api.put<Post>(`/admin/posts/${id}/approve`);
    return response.data;
  },
  
  rejectPost: async (id: number, reason?: string): Promise<Post> => {
    const response = await api.put<Post>(`/admin/posts/${id}/reject`, { reason });
    return response.data;
  },
  
  publishPost: async (id: number): Promise<Post> => {
    const response = await api.put<Post>(`/admin/posts/${id}/publish`);
    return response.data;
  },
};

export default api;
