import axiosInstance from './axios';
import endpoints from './endpoints';
import { AuthResponse, ApiListResponse, ApiResponse, LovePage, VerifyPinResponse, User } from '../types';

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
  }
};
export default api;
