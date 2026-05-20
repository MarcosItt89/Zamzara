import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryMenu from "../components/CategoryMenu";
import PostCard from "../components/PostCard";

function User({ darkMode, toggleDark }) {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchText, setSearchText] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("is_published", true)  // solo publicaciones aprobadas
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar publicaciones:", error.message);
      setLoading(false);
      return;
    }

    setAllPosts(data || []);
    setLoading(false);
  }

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "Todas" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (post.description || "").toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        <div className="container">
          <main className="main">
            <div className="section-header">
              <h2 className="section-title">Lo más nuevo</h2>
            </div>

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

export default User;
