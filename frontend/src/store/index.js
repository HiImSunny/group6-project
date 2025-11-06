import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: { auth: authReducer },
  devTools: true, // bật rõ ràng
});

// GỢI Ý: expose store ra window để tự kiểm tra nhanh
if (process.env.NODE_ENV !== "production") {
  // CRA: dùng process.env
  window.__APP_STORE__ = store;
}
