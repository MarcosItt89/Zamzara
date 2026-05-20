import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/icons/zamzara.ico";

function AdminLogin() {
  const { user, isAdmin, loading, checkingAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");

  if (loading || checkingAdmin) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    // Verify the user exists in admin_profiles
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) console.error("admin_profiles error:", profileError);

    if (!profile) {
      await supabase.auth.signOut();
      setError("No tienes permisos de administrador.");
      setSubmitting(false);
      return;
    }

    navigate("/admin", { replace: true });
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="Zamzara" className="login-logo" />
        <h1 className="login-title">Zamzara</h1>
        <p className="login-subtitle">Panel de administración</p>

        {error && (
          <p className="login-error" style={{ marginBottom: 16 }}>{error}</p>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="admin-login-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="admin-login-input"
          />
          <button
            type="submit"
            disabled={submitting}
            className="admin-login-submit"
          >
            {submitting ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="login-back-link">
          <Link to="/">← Volver a la tienda</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
