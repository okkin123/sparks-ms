import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./Theme";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import ForgotPassword from "./Pages/ForgotPassword";
import ChangePassword from "./Pages/ChangePassword";

import ProtectedRoutes from "./ProtectedRoutes";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" Component={Login} /> {/* 👈 Renders at /app/ */}
            <Route path="/register" Component={Register} />
            <ProtectedRoutes path="/dashboard" Component={Dashboard} />
            <Route path="/forgotpassword" Component={ForgotPassword} />
            <Route path="/changepassword" Component={ChangePassword} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
