// frontend/src/lib/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // nếu backend dùng cookie, còn JWT thuần thì không cần
});

// đọc/ghi token vào localStorage
const LS = { access: 'accessToken', refresh: 'refreshToken' };

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(LS.access);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// refresh khi 401
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        // xếp hàng đợi đến khi refresh xong
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      try {
        isRefreshing = true;
        const refreshToken = localStorage.getItem(LS.refresh);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          (import.meta.env.VITE_API_BASE || API_URL) + '/refresh',
          { refreshToken }
        );
        const newAccess = data?.accessToken;
        if (!newAccess) throw new Error('No new access token');

        localStorage.setItem(LS.access, newAccess);
        // giải quyết hàng đợi
        queue.forEach(p => p.resolve(newAccess));
        queue = [];
        isRefreshing = false;

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        queue.forEach(p => p.reject(e));
        queue = [];
        isRefreshing = false;
        // xóa token để buộc đăng nhập lại
        localStorage.removeItem(LS.access);
        localStorage.removeItem(LS.refresh);
        localStorage.removeItem('user');
        // chuyển hướng login tùy App (có thể phát event)
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
