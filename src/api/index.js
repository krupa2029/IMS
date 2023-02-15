import axios from "axios";
import { API_BASE_URL } from "./api.config";

const API = axios.create({ baseURL: API_BASE_URL });

API.interceptors.request.use((req) => {
  const storedUserData = localStorage.getItem("userData");
  const userDataJson = JSON.parse(storedUserData);
  const token = userDataJson?.accessToken;

  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }

  return req;
});

export const login = (formData) =>
  API.post("/user-role-management/user/login", formData);
