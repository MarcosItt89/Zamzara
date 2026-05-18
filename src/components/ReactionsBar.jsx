import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function ReactionsBar({ postId }) {
  const [counts, setCounts] = useState({ like: 0, love: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  async function fetchReactions() {
    const { data, error } = await supabase
      .from("post_reactions")
      .select("reaction_type")
      .eq("post_id", postId);

    if (error) {
      console.error("Error al cargar reacciones:", error.message);
      return;
    }

    const likeCount = data.filter((item) => item.reaction_type === "like").length;
    const loveCount = data.filter((item) => item.reaction_type === "love").length;

    setCounts({
      like: likeCount,
      love: loveCount,
    });
  }

  async function addReaction(type) {
    setLoading(true);

    const { error } = await supabase.from("post_reactions").insert([
      {
        post_id: postId,
        reaction_type: type,
      },
    ]);

    if (error) {
      console.error("Error al guardar reacción:", error.message);
      setLoading(false);
      return;
    }

    await fetchReactions();
    setLoading(false);
  }

  return (
    <div className="reactions-bar">
      <button onClick={() => addReaction("like")} disabled={loading}>
        👍 {counts.like}
      </button>

      <button onClick={() => addReaction("love")} disabled={loading}>
        ❤️ {counts.love}
      </button>
    </div>
  );
}

export default ReactionsBar;