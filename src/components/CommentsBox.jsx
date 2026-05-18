import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function CommentsBox({ postId }) {
  const [comments, setComments] = useState([]);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    const { data, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar comentarios:", error.message);
      return;
    }

    setComments(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("post_comments").insert([
      {
        post_id: postId,
        author_name: authorName.trim() || "Anónimo",
        comment: comment.trim(),
      },
    ]);

    if (error) {
      console.error("Error al guardar comentario:", error.message);
      setLoading(false);
      return;
    }

    setAuthorName("");
    setComment("");
    await fetchComments();
    setLoading(false);
  }

  return (
    <div className="comments-box">
      <h4>Comentarios</h4>

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Tu nombre"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />

        <textarea
          placeholder="Escribe un comentario"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Comentar"}
        </button>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p>Aún no hay comentarios.</p>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="comment-item">
              <strong>{item.author_name || "Anónimo"}</strong>
              <p>{item.comment}</p>
              <small>
                {new Date(item.created_at).toLocaleDateString()}{" "}
                {new Date(item.created_at).toLocaleTimeString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentsBox;