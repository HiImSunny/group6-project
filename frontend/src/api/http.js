// frontend/src/api/http.js
import axios from 'axios';

console.log("🔥 http.js loaded");

const http = axios.create({
  baseURL: "http://localhost:3000", // đổi nếu backend port khác
});

http.interceptors.request.use(config => {
  const access = localStorage.getItem("accessToken");
  console.log("[http] accessToken:", access?.slice(0,20))
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});


let refreshing = null;

http.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      console.log('[http] 401 received for', original.url);
      if (!refreshing) {
        console.log('[http] starting refresh token request...');
        refreshing = axios.post(`http://localhost:3000/refresh`, {
          refreshToken: localStorage.getItem('refreshToken')
        }).then(res => {
          console.log('[http] refresh success');
          localStorage.setItem('accessToken', res.data.accessToken);
          refreshing = null;
          return res.data.accessToken;
        }).catch(e => {
          console.log('[http] refresh failed', e.response?.data || e.message);
          refreshing = null;
          throw e;
        });
      } else {
        console.log('[http] waiting on existing refresh promise');
      }
      const newAccess = await refreshing;
      original.headers.Authorization = `Bearer ${newAccess}`;
      console.log('[http] retrying original request', original.url);
      return http(original);
    }
    throw err;
  }
);

export default http;
