import logo from "../assets/icons/zamzara.ico";

function Navbar({ searchText, setSearchText, darkMode, setDarkMode }) {
  return (
    <div className="navbar-wrapper">
      <header className="navbar">
        <div className="brand">
          <img src={logo} alt="Zamzara" className="brand-logo" />

          <div>
            <h1>Zamzara</h1>
            <p>Creando tu momento</p>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar decoraciones, ideas, temas..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="navbar-actions">
          <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Modo claro" : "Modo oscuro"}
          </button>
        </div>
      </header>
    </div>
  );
}

export default Navbar;