import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "universal-cookie";
const cookies = new Cookies();

// receives component and any other props represented by ...rest
export default function ProtectedRoutes({ children, ...rest }) {
 
        const token = cookies.get("TOKEN");
        return token ? children : <Navigate to="/" />
  
}