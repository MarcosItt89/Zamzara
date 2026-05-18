import instagramIcon from "../assets/icons/instagram.jpg";
import facebookIcon from "../assets/icons/facebook.png";
import tiktokIcon from "../assets/icons/tiktok.png";
import whatsappIcon from "../assets/icons/whatsapp.png";

function Sidebar() {
  const socials = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/zamzara.deco/",
      icon: instagramIcon,
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/marcezamzara",
      icon: facebookIcon,
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@zamzara.deco",
      icon: tiktokIcon,
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/526641955845",
      icon: whatsappIcon,
    },
  ];

  return (
    <div>
      <aside className="sidebar">
        <h3>Síguenos</h3>

        <div className="social-list">
          {socials.map((social) => (
            <a
              key={social.name}
              className="social-item"
              href={social.url}
              target="_blank"
              rel="noreferrer"
            >
              <img src={social.icon} alt={social.name} className="social-icon" />
              <span>{social.name}</span>
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;