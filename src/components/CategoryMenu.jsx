function CategoryMenu({ activeCategory, setActiveCategory }) {
  const categories = [
    "Todas",
    "Cumpleaños",
    "XV",
    "Baby Shower",
    "Revelación de Género",
    "Bautizo",
    "Aniversario",
    "Graduación",
    "Navidad",
    "Halloween",
    "Año Nuevo",
    "Centros de mesa",
    "Mesita de niños",
    "Mesa de niños",
    "Mesa de dulces",
  ];

  return (
    <div className="category-bar-wrapper">
      <div className="category-menu">
        {categories.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? "active" : ""}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryMenu;