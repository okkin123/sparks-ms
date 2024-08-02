import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const token = cookies.get("FORGOT_TOKEN");

const ForgotInstance = axios.create({
  baseURL: "https://yzm2jg-3001.csb.app/",
  //baseURL: "http://localhost:3001/",
  headers: {
    //  Authorization: `<Your Auth Token>`,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  // .. other options
});

export default ForgotInstance;
