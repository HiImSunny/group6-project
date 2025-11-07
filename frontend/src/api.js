// frontend/src/api.js
import axios from "axios";

let _store; // được gắn từ store/index.js

export const attachStore = (store) => { _store = store; };

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // nếu backend set cookie
});

// Interceptor thêm accessToken
api.interceptors.request.use((cfg) => {
  const state = _store?.getState?.();
  const token = state?.auth?.accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Interceptor tự refresh khi 401
let refreshing = false;
let waiters = [];
const resolveWaiters = (tkn) => { waiters.forEach(fn => fn(tkn)); waiters = []; };

api.interceptors.response.use(
  r => r,
  async (err) => {
    const { response, config } = err || {};
    if (!response) return Promise.reject(err);
    if (response.status !== 401 || config.__retry) return Promise.reject(err);

    // tránh lặp vô hạn
    config.__retry = true;

    // Nếu đang refresh, đợi
    if (refreshing) {
      const newToken = await new Promise((res) => waiters.push(res));
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      }
      return Promise.reject(err);
    }

    try {
      refreshing = true;
      const res = await api.post("/refresh"); // yêu cầu backend đọc refreshToken từ cookie/localStorage tuỳ bạn
      const { accessToken } = res.data || {};
      _store.dispatch({ type: "auth/setAccessToken", payload: accessToken });
      resolveWaiters(accessToken);
      config.headers.Authorization = `Bearer ${accessToken}`;
      return api(config);
    } catch (e) {
      resolveWaiters(null);
      _store.dispatch({ type: "logout" });
      return Promise.reject(err);
    } finally {
      refreshing = false;
    }
  }
);

export default api;
