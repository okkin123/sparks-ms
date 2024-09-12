import axios from 'axios';
import Cookies from "universal-cookie";

const cookies = new Cookies();
// Create an Axios instance
const AxiosFileInstance = axios.create({
  baseURL: "http://localhost:4000/",
  headers: {
    "Content-Type": "multipart/form-data"
  }
});

AxiosFileInstance.interceptors.request.use(config => {
  const token = cookies.get("TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default AxiosFileInstance;

// // Function to upload file and JSON data
// const uploadData = async (file, jsonData) => {
//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('jsonData', JSON.stringify(jsonData));

//   try {
//     const response = await AxiosInstance.post('/upload', formData);
//     console.log(response.data);
//   } catch (error) {
//     console.error(error);
//   }
// };

// // Example usage
// const file = document.querySelector('input[type="file"]').files[0];
// const jsonData = { key: 'value' };

// uploadData(file, jsonData);
