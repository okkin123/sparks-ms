import "./Font.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import ForgotPassword from "./Pages/ForgotPassword";
import NewPassword from "./Pages/NewPassword";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Login} /> {/* 👈 Renders at /app/ */}
          <Route path="/Dashboard" Component={Dashboard} />
          <Route path="/ForgotPassword" Component={ForgotPassword} />
          <Route path="/NewPassword" Component={NewPassword} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
