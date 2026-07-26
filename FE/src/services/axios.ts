import axios from 'axios';
import config from '../app/config';

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem('token');
    if (token && !cfg.headers.Authorization) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
    return Promise.reject({ ...error, message });
  }
);

export default axiosInstance;
