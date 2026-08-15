import axiosInstance from './axios';
import endpoints from './endpoints';
import {
  AuthResponse,
  ApiListResponse,
  ApiResponse,
  LovePage,
  VerifyPinResponse,
  User,
  ThemeCategory,
  Occasion,
  Theme,
  Music,
  AdminStats
} from '../types';

export const api = {
  auth: {
    register: (data: any): Promise<AuthResponse> => {
      return axiosInstance.post(endpoints.auth.register, data);
    },
    login: (data: any): Promise<AuthResponse> => {
      return axiosInstance.post(endpoints.auth.login, data);
    },
    getAdminUsers: (): Promise<{ success: boolean; users: User[] }> => {
      return axiosInstance.get(endpoints.auth.adminUsers);
    },
    deleteAdminUser: (id: string): Promise<{ success: boolean; message: string }> => {
      return axiosInstance.delete(endpoints.auth.deleteUser(id));
    }
  },
  loves: {
    getLoves: (): Promise<ApiListResponse<LovePage>> => {
      return axiosInstance.get(endpoints.loves.base);
    },
    createLove: (formData: FormData): Promise<ApiResponse<LovePage>> => {
      return axiosInstance.post(endpoints.loves.base, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    updateLove: (id: string, formData: FormData): Promise<ApiResponse<LovePage>> => {
      return axiosInstance.put(endpoints.loves.detail(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    deleteLove: (id: string): Promise<{ success: boolean; message: string }> => {
      return axiosInstance.delete(endpoints.loves.detail(id));
    },
    verifyPin: (slug: string, pin: string): Promise<VerifyPinResponse> => {
      return axiosInstance.post(endpoints.loves.verifyPin, { slug, pin });
    },
    getLovePageBySlug: (slug: string, pinToken: string): Promise<ApiResponse<LovePage>> => {
      return axiosInstance.get(endpoints.loves.pageBySlug(slug), {
        headers: {
          Authorization: `Bearer ${pinToken}`,
        },
      });
    },
    incrementView: (slug: string): Promise<{ success: boolean; message: string; views: number }> => {
      return axiosInstance.patch(endpoints.loves.incrementView(slug));
    }
  },
  themeCategories: {
    getCategories: (): Promise<ApiResponse<ThemeCategory[]>> => {
      return axiosInstance.get(endpoints.themeCategories.base);
    },
    getAdminCategories: (): Promise<ApiResponse<ThemeCategory[]>> => {
      return axiosInstance.get(endpoints.themeCategories.admin);
    },
    createCategory: (data: any): Promise<ApiResponse<ThemeCategory>> => {
      return axiosInstance.post(endpoints.themeCategories.admin, data);
    },
    updateCategory: (id: string, data: any): Promise<ApiResponse<ThemeCategory>> => {
      return axiosInstance.patch(endpoints.themeCategories.adminDetail(id), data);
    },
    deleteCategory: (id: string): Promise<{ success: boolean; message: string }> => {
      return axiosInstance.delete(endpoints.themeCategories.adminDetail(id));
    }
  },
  occasions: {
    getOccasions: (): Promise<ApiResponse<Occasion[]>> => {
      return axiosInstance.get(endpoints.occasions.base);
    },
    getAdminOccasions: (): Promise<ApiResponse<Occasion[]>> => {
      return axiosInstance.get(endpoints.occasions.admin);
    },
    createOccasion: (data: any): Promise<ApiResponse<Occasion>> => {
      return axiosInstance.post(endpoints.occasions.admin, data);
    },
    updateOccasion: (id: string, data: any): Promise<ApiResponse<Occasion>> => {
      return axiosInstance.patch(endpoints.occasions.adminDetail(id), data);
    },
    deleteOccasion: (id: string): Promise<{ success: boolean; message: string }> => {
      return axiosInstance.delete(endpoints.occasions.adminDetail(id));
    }
  },
  themes: {
    getThemes: (recipient?: string, occasion?: string): Promise<ApiResponse<Theme[]>> => {
      const params = { recipient, occasion };
      return axiosInstance.get(endpoints.themes.base, { params });
    },
    getThemeByKey: (key: string): Promise<ApiResponse<Theme>> => {
      return axiosInstance.get(endpoints.themes.byKey(key));
    },
    getThemeDetails: (id: string): Promise<ApiResponse<Theme>> => {
      return axiosInstance.get(endpoints.themes.detail(id));
    },
    getAdminThemes: (): Promise<ApiResponse<Theme[]>> => {
      return axiosInstance.get(endpoints.themes.adminList);
    },
    createTheme: (formData: FormData): Promise<ApiResponse<Theme>> => {
      return axiosInstance.post(endpoints.themes.admin, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    updateTheme: (id: string, formData: FormData): Promise<ApiResponse<Theme>> => {
      return axiosInstance.patch(endpoints.themes.adminDetail(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    deleteTheme: (id: string): Promise<{ success: boolean; message: string }> => {
      return axiosInstance.delete(endpoints.themes.adminDetail(id));
    }
  },
  musics: {
    getMusics: (): Promise<ApiResponse<Music[]>> => {
      return axiosInstance.get(endpoints.musics.base);
    },
    getAdminMusics: (): Promise<ApiResponse<Music[]>> => {
      return axiosInstance.get(endpoints.musics.admin);
    },
    createMusic: (formData: FormData): Promise<ApiResponse<Music>> => {
      return axiosInstance.post(endpoints.musics.admin, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    updateMusic: (id: string, formData: FormData): Promise<ApiResponse<Music>> => {
      return axiosInstance.patch(endpoints.musics.adminDetail(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    deleteMusic: (id: string): Promise<{ success: boolean; message: string }> => {
      return axiosInstance.delete(endpoints.musics.adminDetail(id));
    },
    searchFreeMusics: (query: string): Promise<ApiResponse<any[]>> => {
      return axiosInstance.get(endpoints.musics.searchFree, { params: { q: query } });
    }
  },
  admin: {
    getDashboardStats: (): Promise<ApiResponse<AdminStats>> => {
      return axiosInstance.get(endpoints.admin.dashboardStats);
    },
    getPages: (): Promise<ApiResponse<LovePage[]>> => {
      return axiosInstance.get(endpoints.admin.pages);
    },
    updatePageStatus: (id: string, status: string): Promise<ApiResponse<LovePage>> => {
      return axiosInstance.patch(endpoints.admin.pageStatus(id), { status });
    },
    deletePage: (id: string): Promise<{ success: boolean; message: string }> => {
      return axiosInstance.delete(endpoints.admin.pageDelete(id));
    }
  }
};
export default api;
