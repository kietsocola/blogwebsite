export type Role = 'ADMIN' | 'AUTHOR';
export type PostStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt: string;
  featuredImage?: string;
  status: PostStatus;
  author: {
    id: number;
    username: string;
  };
  category: Category;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Stats {
  totalPosts: number;
  totalUsers: number;
  totalCategories: number;
  totalTags: number;
}

export interface PostRequest {
  title: string;
  content: string;
  slug?: string;
  categoryId: number;
  tags?: string[];
  status: PostStatus;
  featuredImage?: string;
}

export interface CategoryRequest {
  name: string;
  slug?: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}
