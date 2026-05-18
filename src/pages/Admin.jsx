import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Admin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Cumpleaños");
  const [imageUrl, setImageUrl] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    instagram_url: "",
    facebook_url: "",
    tiktok_url: "",
    whatsapp_url: "",
    about_button_url: "",
  });

  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error | warning

  useEffect(() => {
    fetchSettings();
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("FETCH POSTS DATA:", data);
    console.log("FETCH POSTS ERROR:", error);

    if (error) {
      console.error("Error al cargar posts admin:", error.message);
      setMessage(`Error al cargar publicaciones: ${error.message}`);
      setMessageType("error");
      return;
    }

    setPosts(data || []);
  }

  async function fetchSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();

    console.log("FETCH SETTINGS DATA:", data);
    console.log("FETCH SETTINGS ERROR:", error);

    if (error) {
      console.error("Error al cargar settings:", error.message);
      setMessage(`Error al cargar configuración: ${error.message}`);
      setMessageType("error");
      return;
    }

    setSettings(data);
  }

  function isValidUrl(value) {
    if (!value.trim()) return true;

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // Validaciones básicas
    if (!title.trim()) {
      setMessage("El título es obligatorio.");
      setMessageType("warning");
      return;
    }

    if (!description.trim()) {
      setMessage("La descripción es obligatoria.");
      setMessageType("warning");
      return;
    }

    if (!category.trim()) {
      setMessage("La categoría es obligatoria.");
      setMessageType("warning");
      return;
    }

    if (!isValidUrl(imageUrl)) {
      setMessage("La URL de la imagen no es válida.");
      setMessageType("warning");
      return;
    }

    if (!isValidUrl(locationUrl)) {
      setMessage(
        "La ubicación debe ser una URL válida si la vas a llenar. Si solo quieres escribir una dirección, conviene cambiar ese campo en la base de datos."
      );
      setMessageType("warning");
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      image_url: imageUrl.trim() || null,
      location_url: locationUrl.trim() || null,
      published,
    };

    console.log("PAYLOAD A INSERTAR:", payload);

    const { data, error } = await supabase
      .from("posts")
      .insert([payload])
      .select();

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    if (error) {
      console.error("Error al guardar publicación:", error);

      setMessage(
        `Error al guardar publicación: ${error.message}${
          error.details ? ` | Details: ${error.details}` : ""
        }${error.hint ? ` | Hint: ${error.hint}` : ""}`
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    setMessage("Publicación guardada correctamente.");
    setMessageType("success");

    setTitle("");
    setDescription("");
    setCategory("Cumpleaños");
    setImageUrl("");
    setLocationUrl("");
    setPublished(true);
    setLoading(false);

    await fetchPosts();
  }

  async function updateSettings(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!isValidUrl(settings.instagram_url || "")) {
      setMessage("El link de Instagram no es válido.");
      setMessageType("warning");
      return;
    }

    if (!isValidUrl(settings.facebook_url || "")) {
      setMessage("El link de Facebook no es válido.");
      setMessageType("warning");
      return;
    }

    if (!isValidUrl(settings.tiktok_url || "")) {
      setMessage("El link de TikTok no es válido.");
      setMessageType("warning");
      return;
    }

    if (!isValidUrl(settings.whatsapp_url || "")) {
      setMessage("El link de WhatsApp no es válido.");
      setMessageType("warning");
      return;
    }

    if (!isValidUrl(settings.about_button_url || "")) {
      setMessage("El link del botón 'Conócenos más' no es válido.");
      setMessageType("warning");
      return;
    }

    const payload = {
      instagram_url: settings.instagram_url || null,
      facebook_url: settings.facebook_url || null,
      tiktok_url: settings.tiktok_url || null,
      whatsapp_url: settings.whatsapp_url || null,
      about_button_url: settings.about_button_url || null,
      updated_at: new Date().toISOString(),
    };

    console.log("SETTINGS PAYLOAD:", payload);

    const { data, error } = await supabase
      .from("settings")
      .update(payload)
      .eq("id", 1)
      .select();

    console.log("UPDATE SETTINGS DATA:", data);
    console.log("UPDATE SETTINGS ERROR:", error);

    if (error) {
      console.error("Error al actualizar settings:", error);
      setMessage(
        `Error al actualizar links: ${error.message}${
          error.details ? ` | Details: ${error.details}` : ""
        }${error.hint ? ` | Hint: ${error.hint}` : ""}`
      );
      setMessageType("error");
      return;
    }

    setMessage("Links actualizados correctamente.");
    setMessageType("success");
  }

  return (
    <div className="admin-page">
      <h1>Panel de Administración</h1>

      {message && (
        <div className={`admin-message ${messageType}`}>
          {message}
        </div>
      )}

      <section className="admin-section">
        <h2>Nueva publicación</h2>

        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Cumpleaños">Cumpleaños</option>
            <option value="XV">XV</option>
            <option value="Baby Shower">Baby Shower</option>
            <option value="Revelación de Género">Revelación de Género</option>
            <option value="Bautizo">Bautizo</option>
            <option value="Aniversario">Aniversario</option>
            <option value="Graduación">Graduación</option>
            <option value="Navidad">Navidad</option>
            <option value="Halloween">Halloween</option>
            <option value="Año Nuevo">Año Nuevo</option>
            <option value="Centros de mesa">Centros de mesa</option>
            <option value="Mesita de niños">Mesita de niños</option>
            <option value="Mesa de niños">Mesa de niños</option>
            <option value="Mesa de dulces">Mesa de dulces</option>
          </select>

          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="text"
            placeholder="URL de imagen"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <input
            type="text"
            placeholder="URL de ubicación o salón"
            value={locationUrl}
            onChange={(e) => setLocationUrl(e.target.value)}
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publicada
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar publicación"}
          </button>
        </form>
      </section>

      <section className="admin-section">
        <h2>Redes sociales</h2>

        <form className="admin-form" onSubmit={updateSettings}>
          <input
            type="text"
            placeholder="Instagram"
            value={settings.instagram_url || ""}
            onChange={(e) =>
              setSettings({ ...settings, instagram_url: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Facebook"
            value={settings.facebook_url || ""}
            onChange={(e) =>
              setSettings({ ...settings, facebook_url: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="TikTok"
            value={settings.tiktok_url || ""}
            onChange={(e) =>
              setSettings({ ...settings, tiktok_url: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="WhatsApp"
            value={settings.whatsapp_url || ""}
            onChange={(e) =>
              setSettings({ ...settings, whatsapp_url: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Botón Conócenos más"
            value={settings.about_button_url || ""}
            onChange={(e) =>
              setSettings({ ...settings, about_button_url: e.target.value })
            }
          />

          <button type="submit">Actualizar links</button>
        </form>
      </section>

      <section className="admin-section">
        <h2>Publicaciones guardadas</h2>

        <div className="admin-posts-list">
          {posts.length === 0 ? (
            <p>No hay publicaciones aún.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="admin-post-item">
                <strong>{post.title}</strong>
                <p>{post.category}</p>
                <small>{new Date(post.created_at).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Admin;