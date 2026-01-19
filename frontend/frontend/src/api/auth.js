import axios from "axios";

const API_URL = "http://localhost:8000";

export const loginRequest = (data) => {
  return axios.post(`${API_URL}/api/auth/login`, data);
};
