import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryMenu from "../components/CategoryMenu";
import PostCard from "../components/PostCard";

function Home({ darkMode, toggleDark }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchText, setSearchText] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar publicaciones:", error.message);
      setLoading(false);
      return;
    }
    setAllPosts(data || []);
    setLoading(false);
  }

  function showMsg(text) {
    setActionMsg(text);
    setTimeout(() => setActionMsg(""), 3000);
  }

  async function handleApprove(postId) {
    const { error } = await supabase
      .from("posts")
      .update({
        is_published: true,
        published: true,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      console.error("Error al publicar:", error.message);
      showMsg("Error al publicar. Revisa la consola.");
      return;
    }
    setAllPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_published: true, published: true, status: "published" }
          : p
      )
    );
    showMsg("Publicación aprobada y visible en User.");
  }

  async function handleUnpublish(postId) {
    const { error } = await supabase
      .from("posts")
      .update({
        is_published: false,
        published: false,
        status: "draft",
      })
      .eq("id", postId);

    if (error) {
      console.error("Error al despublicar:", error.message);
      showMsg("Error al despublicar. Revisa la consola.");
      return;
    }
    setAllPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_published: false, published: false, status: "draft" }
          : p
      )
    );
    showMsg("Publicación retirada de User.");
  }

  async function handleDelete(postId) {
    if (!window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("Error al eliminar:", error.message);
      showMsg("Error al eliminar. Revisa la consola.");
      return;
    }
    setAllPosts((prev) => prev.filter((p) => p.id !== postId));
    showMsg("Publicación eliminada.");
  }

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "Todas" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (post.description || "").toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pending = allPosts.filter((p) => !p.is_published && !p.published).length;

  return (
    <>
      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />
      <CategoryMenu
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="page-content">
        <div className="preview-topbar">
          <div className="internal-banner">
            Vista de revisión — administrador
            {pending > 0 && (
              <span className="banner-badge">
                {pending} pendiente{pending > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            className="back-to-admin-btn"
            onClick={() => navigate("/admin")}
          >
            ← Volver al Admin
          </button>
        </div>

        {actionMsg && (
          <div className="action-toast">{actionMsg}</div>
        )}

        <div className="container">
          <main className="main">
            {loading ? (
              <div className="posts-loading">
                <div className="loading-spinner" />
                <p>Cargando publicaciones...</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  image={post.image_url}
                  category={post.category}
                  date={new Date(post.created_at).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  description={post.description}
                  locationUrl={post.location_url}
                  published={post.is_published || post.published}
                  onApprove={() => handleApprove(post.id)}
                  onUnpublish={() => handleUnpublish(post.id)}
                  onDelete={() => handleDelete(post.id)}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No se encontraron publicaciones.</p>
              </div>
            )}
          </main>
          <Sidebar />
        </div>
      </div>
    </>
  );
}

export default Home;
