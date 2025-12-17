import React, { useState, useEffect } from "react";
import MenuItem from "./MenuItem";
import MenuFilter from "./MenuFilter";
import { fetchMenuItems } from "../../services/menuService";
import "../../styles/menu.css";

const MenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true);
        const data = await fetchMenuItems();
        setMenuItems(data);
        setFilteredItems(data);

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((item) => item.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError("Failed to load menu items. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  const handleFilterChange = (category) => {
    setActiveCategory(category);
    if (category === "all") {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter((item) => item.category === category));
    }
  };

  if (loading) {
    return <div className="menu-loading">Loading menu...</div>;
  }

  if (error) {
    return <div className="menu-error">{error}</div>;
  }

  return (
    <div className="menu-container">
      <MenuFilter
        categories={categories}
        activeCategory={activeCategory}
        onFilterChange={handleFilterChange}
      />
      <div className="menu-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => <MenuItem key={item.id} item={item} />)
        ) : (
          <p className="no-items">No items found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default MenuList;