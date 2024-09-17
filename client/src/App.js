import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./Theme";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Wrapper from "./Pages/Wrapper";
import ForgotPassword from "./Pages/ForgotPassword";
import EnterCode from "./Pages/EnterCode";
import ChangePassword from "./Pages/ChangePassword";
import QDetails from "./Pages/Quotations/Details";
import QEdit from "./Pages/Quotations/Edit";
import InvoiceDetails from "./Pages/Invoices/Details";
import ProtectedRoutes from "./ProtectedRoutes";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <BrowserRouter>
         <Routes>
            <Route path="/login" Component={Login} />
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
              path="/"
              element={
                <ProtectedRoutes>
                    <Wrapper />
                </ProtectedRoutes>
              }
            />
            <Route path="/quotation/details" Component={QDetails} />
            <Route path="/quotation/edit" Component={QEdit} />
            <Route path="/invoice/details" Component={InvoiceDetails} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
