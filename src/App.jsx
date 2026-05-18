import { useState } from "react";
import User from "./pages/User";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import "./styles/global.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState("user");

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="top-debug">
        <button onClick={() => setCurrentPage("user")}>Ver User</button>
        <button onClick={() => setCurrentPage("home")}>Ver Home</button>
        <button onClick={() => setCurrentPage("admin")}>Ver Admin</button>
      </div>

      {currentPage === "user" && (
        <User darkMode={darkMode} setDarkMode={setDarkMode} />
      )}

      {currentPage === "home" && (
        <Home darkMode={darkMode} setDarkMode={setDarkMode} />
      )}

      {currentPage === "admin" && (
        <Admin darkMode={darkMode} setDarkMode={setDarkMode} />
      )}
    </div>
  );
}

export default App;