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
  mainImage?: string;
  layout?: string;
  background?: string;
  primaryColor?: string;
  secondaryColor?: string;
  music?: string;
  recipient?: string;
  occasion?: string;
}

export type RecipientType = 'LOVER' | 'MOTHER' | 'FATHER' | 'SPOUSE' | 'FAMILY' | 'GRANDPARENT' | 'FRIEND' | 'CHILD' | 'TEACHER' | 'OTHER';

export interface LovePage {
  _id: string;
  userId: string;
  title: string;
  slug: string;
  theme: string;
  recipientType?: RecipientType;
  occasion?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';
  content: LovePageContent;
  views: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeCategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  displayOrder?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Occasion {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  displayOrder?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Theme {
  _id: string;
  name: string;
  key: string;
  description?: string;
  thumbnail?: string;
  preview?: string;
  category: string | ThemeCategory;
  supportedRecipientTypes: RecipientType[];
  supportedOccasions: string[] | Occasion[];
  primaryColor?: string;
  secondaryColor?: string;
  background?: string;
  font?: string;
  animation?: string;
  defaultMusic?: string;
  layout?: string;
  galleryLayout?: string;
  letterLayout?: string;
  status: 'draft' | 'published' | 'disabled';
  createdAt?: string;
  updatedAt?: string;
}

export interface Music {
  _id: string;
  name: string;
  artist?: string;
  duration?: number;
  file: string;
  thumbnail?: string;
  category?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPages: number;
  totalThemes: number;
  totalCategories: number;
  totalViews: number;
  themeStats: { _id: string; count: number }[];
  pagesToday: number;
  storageUsage: string;
  storageBytes: number;
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
