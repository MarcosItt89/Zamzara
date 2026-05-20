import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/icons/zamzara.ico";

function AdminNavbar({ section }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate("/admin-login", { replace: true });
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Admin";

  return (
    <div className="admin-navbar">
      <div className="admin-navbar-brand">
        <img src={logo} alt="Zamzara" className="admin-navbar-logo" />
        <span className="admin-navbar-title">Zamzara Admin</span>
        {section && <span className="admin-navbar-section">/ {section}</span>}
      </div>

      <div className="admin-navbar-actions">
        <span className="admin-navbar-user">{displayName}</span>
        <button
          className="admin-nav-btn"
          onClick={() => navigate("/admin/preview")}
        >
          Vista previa
        </button>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default AdminNavbar;
