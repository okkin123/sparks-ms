import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();


const AxiosInstance = axios.create({
  baseURL: "https://refactored-space-lamp-59xp5jwq6jwcp4q4-4000.app.github.dev/",
  //baseURL: "http://localhost:4000/",
  headers: {
    "Content-Type": "application/json",
  },
  // .. other options
});

AxiosInstance.interceptors.request.use(config => {
  const token = cookies.get("TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


export default AxiosInstance;
