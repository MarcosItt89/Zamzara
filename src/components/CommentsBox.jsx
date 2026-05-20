import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

function CommentsBox({ postId, adminView = false }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");

  useEffect(() => {
    fetchComments();
  }, [postId, adminView]);

  async function fetchComments() {
    let query = supabase
      .from("post_comments")
      .select("id, author_name, comment, created_at, status, is_visible")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    // Admin sees all comments; public only sees visible/approved ones
    if (!adminView) {
      query = query.eq("is_visible", true);
    }

    const { data, error } = await query;
    if (!error && data) setComments(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setLoading(true);
    setMsg("");

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name      ||
      user.email                    ||
      "Usuario";

    const { error } = await supabase.from("post_comments").insert({
      post_id:     postId,
      author_name: displayName,
      comment:     text.trim(),
      user_id:     user.id,
      visitor_id:  user.id,
      is_visible:  true,
      status:      "approved",
    });

    if (error) {
      console.error("Supabase error:", error);
      setMsg("No se pudo guardar. Revisa permisos o sesión.");
      setLoading(false);
      return;
    }

    setText("");
    setMsg("¡Comentario publicado!");
    setTimeout(() => setMsg(""), 3000);
    await fetchComments();
    setLoading(false);
  }

  return (
    <div className="comments-box">
      <h4>Comentarios ({comments.length})</h4>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <p className="comment-author-tag">
            Comentando como{" "}
            <strong>
              {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
            </strong>
          </p>
          <textarea
            placeholder="Escribe un comentario..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {msg && <p className="comment-submit-msg">{msg}</p>}
          <button type="submit" disabled={loading || !text.trim()}>
            {loading ? "Enviando..." : "Comentar"}
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <Link to="/login" className="comment-login-link">
            Inicia sesión para comentar
          </Link>
        </div>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="comments-empty">Aún no hay comentarios.</p>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="comment-item">
              <div className="comment-item-header">
                <strong>{item.author_name || "Anónimo"}</strong>
                {adminView && item.status !== "approved" && (
                  <span className="comment-status-badge">{item.status}</span>
                )}
              </div>
              <p>{item.comment}</p>
              <small>
                {new Date(item.created_at).toLocaleDateString("es-MX", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentsBox;
