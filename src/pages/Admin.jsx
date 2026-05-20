import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AdminNavbar from "../components/AdminNavbar";
import Dashboard from "../components/Dashboard";

const CATEGORIES = [
  "Cumpleaños", "XV", "Baby Shower", "Revelación de Género",
  "Bautizo", "Aniversario", "Graduación", "Navidad",
  "Halloween", "Año Nuevo", "Centros de mesa",
  "Mesita de niños", "Mesa de niños", "Mesa de dulces",
];

function Admin() {
  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "stats"
  const [title, setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Cumpleaños");
  const [imageUrl, setImageUrl] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [saving, setSaving]     = useState(false);

  const [settings, setSettings] = useState({
    instagram_url: "", facebook_url: "",
    tiktok_url: "", whatsapp_url: "", about_button_url: "",
  });

  const [posts, setPosts]       = useState([]);
  const [message, setMessage]   = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchSettings();
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Error al cargar publicaciones: ${error.message}`);
      setMessageType("error");
      return;
    }
    setPosts(data || []);
  }

  async function fetchSettings() {
    const { data, error } = await supabase
      .from("settings").select("*").eq("id", 1).single();

    if (!error && data) setSettings(data);
  }

  function isValidUrl(value) {
    if (!value.trim()) return true;
    try { new URL(value); return true; } catch { return false; }
  }

  function showMsg(text, type = "success") {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim())       { showMsg("El título es obligatorio.", "warning"); return; }
    if (!description.trim()) { showMsg("La descripción es obligatoria.", "warning"); return; }
    if (!isValidUrl(imageUrl))   { showMsg("URL de imagen no válida.", "warning"); return; }
    if (!isValidUrl(locationUrl)){ showMsg("URL de ubicación no válida.", "warning"); return; }

    setSaving(true);
    const { error } = await supabase.from("posts").insert([{
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      image_url: imageUrl.trim() || null,
      location_url: locationUrl.trim() || null,
      is_published: false,
      published: false,
      status: "draft",
    }]);

    if (error) { showMsg(`Error al guardar: ${error.message}`, "error"); setSaving(false); return; }

    showMsg("Borrador guardado. Ve a Vista previa para publicarlo.");
    setTitle(""); setDescription(""); setCategory("Cumpleaños");
    setImageUrl(""); setLocationUrl("");
    setSaving(false);
    await fetchPosts();
  }

  async function updateSettings(e) {
    e.preventDefault();
    const fields = [
      [settings.instagram_url, "Instagram"],
      [settings.facebook_url,  "Facebook"],
      [settings.tiktok_url,    "TikTok"],
      [settings.whatsapp_url,  "WhatsApp"],
      [settings.about_button_url, "Conócenos más"],
    ];
    for (const [val, label] of fields) {
      if (!isValidUrl(val || "")) { showMsg(`El link de ${label} no es válido.`, "warning"); return; }
    }
    const { error } = await supabase.from("settings").update({
      instagram_url:    settings.instagram_url    || null,
      facebook_url:     settings.facebook_url     || null,
      tiktok_url:       settings.tiktok_url       || null,
      whatsapp_url:     settings.whatsapp_url     || null,
      about_button_url: settings.about_button_url || null,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);

    if (error) { showMsg(`Error al actualizar: ${error.message}`, "error"); return; }
    showMsg("Links actualizados correctamente.");
  }

  const pending   = posts.filter((p) => !p.is_published && !p.published).length;
  const published = posts.filter((p) => p.is_published  || p.published).length;

  return (
    <>
      <AdminNavbar />

      <div className="admin-page">
        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab${activeTab === "posts" ? " active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Publicaciones
          </button>
          <button
            className={`admin-tab${activeTab === "stats" ? " active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            Estadísticas
          </button>
        </div>

        {message && (
          <div className={`admin-message ${messageType}`}>{message}</div>
        )}

        {/* ── Tab: Publicaciones ──────────────────────────────────────────── */}
        {activeTab === "posts" && (
          <>
            {/* Nueva publicación */}
            <section className="admin-section">
              <h2>Nueva publicación</h2>
              <p className="admin-hint">
                Se guarda como borrador. Ve a{" "}
                <span
                  style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => window.location.href = "/admin/preview"}
                >
                  Vista previa
                </span>{" "}
                para publicarla.
              </p>

              <form className="admin-form" onSubmit={handleSubmit}>
                <input type="text" placeholder="Título" value={title}
                  onChange={(e) => setTitle(e.target.value)} />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea placeholder="Descripción" value={description}
                  onChange={(e) => setDescription(e.target.value)} />
                <input type="text" placeholder="URL de imagen" value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)} />
                <input type="text" placeholder="URL de ubicación (opcional)" value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)} />
                <button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar como borrador"}
                </button>
              </form>
            </section>

            {/* Redes sociales */}
            <section className="admin-section">
              <h2>Redes sociales</h2>
              <form className="admin-form" onSubmit={updateSettings}>
                {[
                  ["instagram_url", "Instagram (URL)"],
                  ["facebook_url",  "Facebook (URL)"],
                  ["tiktok_url",    "TikTok (URL)"],
                  ["whatsapp_url",  "WhatsApp (URL o wa.me/...)"],
                  ["about_button_url", "URL botón Conócenos más"],
                ].map(([key, label]) => (
                  <input key={key} type="text" placeholder={label}
                    value={settings[key] || ""}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  />
                ))}
                <button type="submit">Actualizar links</button>
              </form>
            </section>

            {/* Lista de publicaciones */}
            <section className="admin-section">
              <h2>Publicaciones guardadas</h2>
              <div className="admin-stats">
                <span className="admin-stat admin-stat--pending">
                  {pending} borrador{pending !== 1 ? "es" : ""}
                </span>
                <span className="admin-stat admin-stat--published">
                  {published} publicada{published !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="admin-posts-list">
                {posts.length === 0 ? (
                  <p>No hay publicaciones aún.</p>
                ) : (
                  posts.map((post) => {
                    const isPublished = post.is_published || post.published;
                    return (
                      <div key={post.id}
                        className={`admin-post-item${!isPublished ? " admin-post-item--pending" : ""}`}
                      >
                        <div className="admin-post-item-header">
                          <strong>{post.title}</strong>
                          <span className={`post-status ${isPublished ? "post-status--published" : "post-status--pending"}`}>
                            {isPublished ? "Publicado" : "Borrador"}
                          </span>
                        </div>
                        <p>{post.category}</p>
                        <small>{new Date(post.created_at).toLocaleString("es-MX")}</small>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}

        {/* ── Tab: Estadísticas ───────────────────────────────────────────── */}
        {activeTab === "stats" && (
          <Dashboard posts={posts} />
        )}
      </div>
    </>
  );
}

export default Admin;
