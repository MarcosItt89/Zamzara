// ─────────────────────────────────────────────────────────────────────────────
// MODO TEMPORAL — Autenticación por PIN local (sin Supabase Auth)
//
// Para volver a Supabase Auth en producción:
//   1. Elimina el bloque marcado [PIN TEMPORAL].
//   2. Descomenta el bloque marcado [SUPABASE AUTH].
//   3. El resto del proyecto no requiere ningún otro cambio.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

// ─── [SUPABASE AUTH] — descomenta esto cuando estés listo: ───────────────────
/*
import { supabase } from "../lib/supabase";

export function useAdminAuth() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    loading: session === undefined,
    user: session?.user ?? null,
  };
}
*/
// ─────────────────────────────────────────────────────────────────────────────

// ─── [PIN TEMPORAL] — elimina este bloque al restaurar Supabase Auth: ────────

export const ADMIN_SESSION_KEY = "zamzara_admin_session";
const AUTH_CHANGE_EVENT = "zamzara_auth_change";

/** Llama esto tras escribir en localStorage para notificar al hook. */
export function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem(ADMIN_SESSION_KEY) === "true"
  );

  useEffect(() => {
    function onAuthChange() {
      setIsAdmin(localStorage.getItem(ADMIN_SESSION_KEY) === "true");
    }
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
  }, []);

  const session = isAdmin ? { user: { email: "Administrador" } } : null;

  return {
    session,
    loading: false, // sync — no hay espera asíncrona
    user: session?.user ?? null,
  };
}
// ─────────────────────────────────────────────────────────────────────────────
