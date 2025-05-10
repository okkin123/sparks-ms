import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();


const AxiosInstance = axios.create({
  
  baseURL: "https://sparks-ms-api.onrender.com/",
  //baseURL: "https://4000-okkin123-sparksms-em0guxdrsgp.ws-us116.gitpod.io/",
  //baseURL: "http://localhost:4000/",
  //baseURL: "https://reimagined-invention-4rw965xj75ghq599-4000.app.github.dev/",
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
