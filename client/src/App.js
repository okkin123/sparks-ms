import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./Theme";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Wrapper from "./Pages/Wrapper";
import ForgotPassword from "./Pages/ForgotPassword";
import EnterCode from "./Pages/EnterCode";
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
            <Route path="/forgotpassword" Component={ForgotPassword} />

            <Route
              path="/entercode"
              element={
                <ProtectedRoutes>
                  <EnterCode />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/changepassword"
              element={
                <ProtectedRoutes>
                  <ChangePassword />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoutes>
                  <Wrapper />
                </ProtectedRoutes>
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
