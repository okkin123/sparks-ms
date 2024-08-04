import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();


const AxiosInstance = axios.create({
  //baseURL: "https://yzm2jg-3001.csb.app/",
  baseURL: "http://localhost:3001/",
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
