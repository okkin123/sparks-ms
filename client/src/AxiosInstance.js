import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();


const AxiosInstance = axios.create({
  baseURL: "https://4000-okkin123-sparksms-3bd5wpxfxws.ws-us115.gitpod.io/",
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
