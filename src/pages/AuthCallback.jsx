import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AuthCallback() {
  const navigate    = useNavigate();
  const navigated   = useRef(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let subscription = null;

    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setErrorMsg(error.message || "No se pudo verificar la sesión.");
        return;
      }

      if (session && !navigated.current) {
        navigated.current = true;
        const { data } = await supabase
          .from("admin_profiles")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();
        navigate(data ? "/admin" : "/", { replace: true });
        return;
      }

      // Session not ready — wait for SIGNED_IN event
      const { data: authData } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (navigated.current) return;

          if (event === "SIGNED_IN" && session) {
            navigated.current = true;
            subscription?.unsubscribe();
            const { data } = await supabase
              .from("admin_profiles")
              .select("id")
              .eq("id", session.user.id)
              .maybeSingle();
            navigate(data ? "/admin" : "/", { replace: true });
          } else if (event === "SIGNED_OUT") {
            navigate("/", { replace: true });
          }
        }
      );
      subscription = authData.subscription;

      // Fallback timeout
      setTimeout(() => {
        if (!navigated.current) {
          setErrorMsg("Tiempo de espera agotado. Intenta iniciar sesión de nuevo.");
        }
      }, 10000);
    }

    handleCallback();
    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (errorMsg) {
    return (
      <div className="no-permission-page">
        <div className="no-permission-card">
          <p className="no-permission-icon">⚠️</p>
          <h2 className="no-permission-title">No se pudo iniciar sesión</h2>
          <p className="no-permission-text">{errorMsg}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/login" className="no-permission-btn">Volver a /login</a>
            <a href="/" className="no-permission-btn" style={{ background: "rgba(255,255,255,0.08)" }}>
              Ir a inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-screen" style={{ flexDirection: "column", gap: 16 }}>
      <div className="loading-spinner" />
      <p style={{ color: "#b8a0d8", fontSize: "0.9rem" }}>Verificando acceso...</p>
    </div>
  );
}

export default AuthCallback;
