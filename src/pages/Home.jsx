import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryMenu from "../components/CategoryMenu";
import PostCard from "../components/PostCard";

function Home({ darkMode, setDarkMode }) {
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
      .eq("published", true)
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
      (post.description || "")
        .toLowerCase()
        .includes(searchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <CategoryMenu
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="page-content">
        <div className="internal-banner">
          Vista interna de prueba
        </div>

        <div className="container">
          <main className="main">
            {loading ? (
              <p>Cargando publicaciones...</p>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  image={post.image_url}
                  category={post.category}
                  date={new Date(post.created_at).toLocaleDateString()}
                  description={post.description}
                  locationUrl={post.location_url}
                />
              ))
            ) : (
              <p>No se encontraron publicaciones.</p>
            )}
          </main>

          <Sidebar />
        </div>
      </div>
    </>
  );
}

export default Home;