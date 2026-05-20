import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

function ReactionsBar({ postId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts]         = useState({ like: 0, love: 0 });
  const [myReaction, setMyReaction] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [errMsg, setErrMsg]         = useState("");

  useEffect(() => {
    fetchReactions();
  }, [postId, user]);

  async function fetchReactions() {
    const { data, error } = await supabase
      .from("post_reactions")
      .select("id, reaction_type, user_id, visitor_id")
      .eq("post_id", postId);

    if (error || !data) return;

    setCounts({
      like: data.filter((r) => r.reaction_type === "like").length,
      love: data.filter((r) => r.reaction_type === "love").length,
    });

    if (user) {
      const mine = data.find(
        (r) => r.user_id === user.id || r.visitor_id === user.id
      );
      setMyReaction(mine?.reaction_type ?? null);
    } else {
      setMyReaction(null);
    }
  }

  async function syncCounters() {
    const [{ count: likes }, { count: hearts }] = await Promise.all([
      supabase
        .from("post_reactions")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("reaction_type", "like"),
      supabase
        .from("post_reactions")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("reaction_type", "love"),
    ]);
    await supabase
      .from("posts")
      .update({ likes: likes || 0, hearts: hearts || 0 })
      .eq("id", postId);

    window.dispatchEvent(new CustomEvent("zamzara:reaction"));
  }

  async function handleReact(type) {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setErrMsg("");

    let opError = null;

    if (myReaction === type) {
      // Toggle off — delete the row
      const { error } = await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      opError = error;
    } else {
      // Insert or change reaction — upsert on (post_id, user_id)
      const { error } = await supabase
        .from("post_reactions")
        .upsert(
          {
            post_id:       postId,
            user_id:       user.id,
            visitor_id:    user.id,
            reaction_type: type,
          },
          { onConflict: "post_id,user_id" }
        );
      opError = error;
    }

    if (opError) {
      console.error("Supabase error:", opError);
      setErrMsg("No se pudo guardar. Revisa permisos o sesión.");
      setLoading(false);
      return;
    }

    await syncCounters();
    await fetchReactions();
    setLoading(false);
  }

  return (
    <div className="reactions-bar">
      <button
        className={myReaction === "like" ? "reacted" : ""}
        onClick={() => handleReact("like")}
        disabled={loading}
        title={user ? "Me gusta" : "Inicia sesión para reaccionar"}
      >
        👍 {counts.like}
      </button>
      <button
        className={myReaction === "love" ? "reacted" : ""}
        onClick={() => handleReact("love")}
        disabled={loading}
        title={user ? "Me encanta" : "Inicia sesión para reaccionar"}
      >
        ❤️ {counts.love}
      </button>

      {!user && (
        <button
          className="reactions-login-btn"
          onClick={() => navigate("/login")}
        >
          Inicia sesión para reaccionar
        </button>
      )}

      {errMsg && <p className="reactions-err">{errMsg}</p>}
    </div>
  );
}

export default ReactionsBar;
