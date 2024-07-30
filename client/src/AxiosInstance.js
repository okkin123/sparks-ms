import axios from "axios"; 

const AxiosInstance = axios.create({
  baseURL : 'http://localhost:3002/',
  headers: {
    //  Authorization: `<Your Auth Token>`,
    'Content-Type': "application/json"
  }, 
  // .. other options
});

export default AxiosInstance;
