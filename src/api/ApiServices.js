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

const ApiServices = {
  login : (payload) => API.post("/user-role-management/user/login", payload),
  getInventoryList : (payload) => API.post("/inventory-management/inventory/list", payload),
  getInventoryCheckoutList : (payload) => API.post("/inventory-management/inventory/checkout-list", payload),
  getLocationList: () => API.get('/inventory-management/inventory/location/list'),
  addEditInventory: (payload) => API.post('/inventory-management/inventory/add-edit', payload),
  checkoutInventory: (payload) => API.post('/inventory-management/inventory/checkout', payload),
}

export default ApiServices;