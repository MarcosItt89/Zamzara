import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedAdminRoute({ children }) {
  const { user, isAdmin, loading, checkingAdmin, signOut } = useAuth();

  if (loading || checkingAdmin) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="no-permission-page">
        <div className="no-permission-card">
          <p className="no-permission-icon">🔒</p>
          <h2 className="no-permission-title">Sin permisos</h2>
          <p className="no-permission-text">
            La cuenta <strong>{user.email}</strong> no tiene permisos de administrador.
          </p>
          <button className="no-permission-btn" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedAdminRoute;
