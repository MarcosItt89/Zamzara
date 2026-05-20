import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import User from "./pages/User";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/Login";
import UserLogin from "./pages/UserLogin";
import AuthCallback from "./pages/AuthCallback";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import "./styles/global.css";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("zamzara-theme");
    return saved !== null ? saved === "dark" : true;
  });

  function toggleDark() {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("zamzara-theme", next ? "dark" : "light");
      return next;
    });
  }

  return (
    <AuthProvider>
      <div className={`app${darkMode ? " dark" : ""}`}>
        <BrowserRouter>
          <Routes>
            {/* Vista pública */}
            <Route
              path="/"
              element={<User darkMode={darkMode} toggleDark={toggleDark} />}
            />

            {/* Login de usuario normal */}
            <Route path="/login" element={<UserLogin />} />

            {/* Login de administrador */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Callback OAuth de Supabase */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Panel admin protegido */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <Admin darkMode={darkMode} toggleDark={toggleDark} />
                </ProtectedAdminRoute>
              }
            />

            {/* Vista previa protegida */}
            <Route
              path="/admin/preview"
              element={
                <ProtectedAdminRoute>
                  <Home darkMode={darkMode} toggleDark={toggleDark} />
                </ProtectedAdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
