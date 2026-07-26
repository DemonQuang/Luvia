export interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface LovePageContent {
  messages: string[];
  images: string[];
  music?: string;
  recipient?: string;
  occasion?: string;
}

export interface LovePage {
  _id: string;
  userId: string;
  title: string;
  slug: string;
  theme: 'cute' | 'romantic' | 'dark';
  content: LovePageContent;
  views: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  total?: number;
  data: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface VerifyPinResponse {
  success: boolean;
  message: string;
  accessToken: string;
}
