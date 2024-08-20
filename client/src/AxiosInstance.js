import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();


const AxiosInstance = axios.create({
  baseURL: "https://miniature-lamp-x4vqx7j59g5hvqqj-5000.app.github.dev/",
  //baseURL: "http://localhost:5000/",
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
