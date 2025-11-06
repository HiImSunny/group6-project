// frontend/src/features/auth/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const loginThunk = createAsyncThunk(
  "login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/login", { email, password });
      // data: { accessToken, refreshToken?, user }
      // Nếu refreshToken dùng cookie httpOnly thì backend đặt cookie, FE không cần lưu
      return data;
    } catch (e) {
      const msg = e?.response?.data?.msg || "Sai thông tin đăng nhập";
      return rejectWithValue(msg);
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  "auth/me",
  async () => {
    const { data } = await api.get("/auth/me");
    return data; // { user }
  }
);
