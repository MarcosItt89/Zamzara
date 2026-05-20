import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]         = useState(undefined); // undefined = still loading
  const [user, setUser]               = useState(null);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Bootstrap: get initial session then listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session ?? null);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check admin_profiles whenever user changes
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      return;
    }

    setCheckingAdmin(true);
    supabase
      .from("admin_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("admin_profiles check error:", error);
        setIsAdmin(!!data);
        setCheckingAdmin(false);
      });
  }, [user]);

  async function signOut() {
    await supabase.auth.signOut();
    localStorage.removeItem("zamzara_dev_admin");
  }

  const loading = session === undefined;

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, checkingAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
