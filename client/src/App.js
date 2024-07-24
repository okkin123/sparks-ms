import './Font.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Pages/Login";
import Main from "./Pages/Main";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" Component={Login} /> {/* 👈 Renders at /app/ */}
            <Route path="/Main" Component={Main} />
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
