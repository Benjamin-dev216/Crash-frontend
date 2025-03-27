// axiosInstance.ts
import axios from "axios";

// Create an Axios instance with a default base URL
const axiosInstance = axios.create({
  baseURL: "http://localhost:4001/api", // Matches your backend setup
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
