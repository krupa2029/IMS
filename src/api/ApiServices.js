import axios from "axios";
import { API_BASE_URL } from "./api.config";

const API = axios.create({ baseURL: API_BASE_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }

  return req;
});

const ApiServices = {
  login : (payload) => API.post("/user-role-management/user/login", payload),
  getUserDetails : () => API.get(`/user-role-management/user/details`),
  getInventoryList : (payload) => API.post("/inventory-management/inventory/list", payload),
  getInventoryCheckoutList : (payload) => API.post("/inventory-management/inventory/checkout-list", payload),
  getLocationList: () => API.get('/inventory-management/inventory/location/list'),
  addEditInventory: (payload) => API.post('/inventory-management/inventory/add-edit', payload),
  checkoutInventory: (payload) => API.post('/inventory-management/inventory/checkout', payload),
  deleteInventory: (payload) => API.post('/inventory-management/inventory/delete', payload),
  returnInventory: (payload) => API.post('/inventory-management/inventory/return', payload),
}

export default ApiServices;