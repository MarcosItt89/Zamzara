import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import instagramIcon from "../assets/icons/instagram.jpg";
import facebookIcon  from "../assets/icons/facebook.png";
import tiktokIcon    from "../assets/icons/tiktok.png";
import whatsappIcon  from "../assets/icons/whatsapp.png";
import logo from "../assets/icons/zamzara.ico";

const SOCIAL_META = {
  instagram_url: { name: "Instagram", icon: instagramIcon },
  facebook_url:  { name: "Facebook",  icon: facebookIcon  },
  tiktok_url:    { name: "TikTok",    icon: tiktokIcon    },
  whatsapp_url:  { name: "WhatsApp",  icon: whatsappIcon  },
};

function popularityScore(p) {
  return (p.views || 0) + (p.likes || 0) * 3 + (p.hearts || 0) * 3;
}

function Sidebar() {
  const { user, signOut } = useAuth();
  const [settings, setSettings]         = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [popularPosts, setPopularPosts] = useState([]);

  const fetchPopularPosts = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, title, category, likes, hearts, views, image_url")
      .eq("is_published", true)
      .order("likes", { ascending: false })
      .order("hearts", { ascending: false })
      .limit(4);

    if (data) {
      const sorted = [...data].sort(
        (a, b) => popularityScore(b) - popularityScore(a)
      );
      setPopularPosts(sorted);
    }
  }, []);

  useEffect(() => {
    // Brand info
    supabase
      .from("site_settings").select("*").eq("id", 1).single()
      .then(({ data }) => { if (data) setSiteSettings(data); });

    // Social links
    supabase
      .from("settings").select("*").eq("id", 1).single()
      .then(({ data }) => { if (data) setSettings(data); });

    fetchPopularPosts();

    // Refresh popular posts whenever a reaction changes
    window.addEventListener("zamzara:reaction", fetchPopularPosts);
    return () => window.removeEventListener("zamzara:reaction", fetchPopularPosts);
  }, [fetchPopularPosts]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const brandName   = siteSettings?.brand_name          || settings?.brand_name  || "Zamzara";
  const tagline     = siteSettings?.tagline              || settings?.tagline     || "Creando tu momento";
  const logoUrl     = siteSettings?.logo_url             || settings?.logo_url    || null;
  const description = siteSettings?.business_description || null;

  const whatsappUrl =
    settings?.whatsapp_url     ||
    siteSettings?.whatsapp_url ||
    settings?.about_button_url ||
    null;

  const socials = Object.entries(SOCIAL_META)
    .filter(([key]) => settings?.[key] || siteSettings?.[key])
    .map(([key, meta]) => ({
      ...meta,
      url: settings?.[key] || siteSettings?.[key],
    }));

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name      ||
    user?.email                    ||
    null;

  return (
    <aside className="sidebar">
      {/* Marca */}
      <div className="sidebar-brand">
        <img
          src={logoUrl || logo}
          alt={brandName}
          className="sidebar-brand-logo"
          onError={(e) => { e.target.src = logo; }}
        />
        <h3>{brandName}</h3>
        <p className="sidebar-tagline">{tagline}</p>
        {description && (
          <p className="sidebar-description">{description}</p>
        )}
      </div>

      {/* Redes sociales */}
      {socials.length > 0 && (
        <>
          <p className="sidebar-section-label">Síguenos</p>
          <div className="social-list">
            {socials.map((s) => (
              <a key={s.name} className="social-item" href={s.url}
                target="_blank" rel="noreferrer"
              >
                <img src={s.icon} alt={s.name} className="social-icon" />
                <span>{s.name}</span>
              </a>
            ))}
          </div>
        </>
      )}

      {/* CTA WhatsApp */}
      {whatsappUrl && (
        <div className="sidebar-cta">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="sidebar-cta-btn">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.123 1.526 5.855L0 24l6.266-1.503A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.912 0-3.708-.508-5.257-1.395l-.377-.224-3.92.94.997-3.807-.246-.394A9.954 9.954 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Contáctanos
          </a>
        </div>
      )}

      {/* Más populares */}
      {popularPosts.length > 0 && (
        <div className="sidebar-popular">
          <p className="sidebar-section-label" style={{ marginTop: 20 }}>
            Más populares
          </p>
          <div className="popular-list">
            {popularPosts.map((post) => (
              <div key={post.id} className="popular-item">
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="popular-item-img"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
                <div className="popular-item-info">
                  <p className="popular-item-title">{post.title}</p>
                  <p className="popular-item-meta">
                    👍 {post.likes || 0} &nbsp; ❤️ {post.hearts || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usuario / sesión */}
      <div className="sidebar-user-section">
        {user ? (
          <>
            <p className="sidebar-user-name">{displayName}</p>
            <button className="sidebar-user-signout" onClick={signOut}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="sidebar-login-link">
            Iniciar sesión / Crear cuenta
          </Link>
        )}
        <Link to="/admin-login" className="sidebar-admin-link">
          🔒 Administración
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
