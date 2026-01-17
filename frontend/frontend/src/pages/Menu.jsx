import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMenuItems } from "../services/menuService";
import { useCart } from "../context/CartContext";
import "../styles/menu.css";

const Menu = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  // Fetch menu items from API
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true);
        const data = await fetchMenuItems();
        setMenuItems(data);
      } catch (error) {
        console.error("Error loading menu items:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMenuItems();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(menuItems.map((item) => item.category))];
    return ["all", ...cats];
  }, [menuItems]);

  // Get price range from menu items
  const priceExtent = useMemo(() => {
    if (menuItems.length === 0) return { min: 0, max: 1000 };
    const prices = menuItems.map((item) => item.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [menuItems]);

  // Filter and sort menu items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...menuItems];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter by price range
    result = result.filter(
      (item) => item.price >= priceRange.min && item.price <= priceRange.max
    );

    // Sort items
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Keep original order
        break;
    }

    return result;
  }, [menuItems, searchQuery, selectedCategory, sortBy, priceRange]);

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  const handleOrderNow = (item) => {
    // Redirect to order form page with item details (don't add to cart)
    navigate("/order-now", { state: { item } });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("default");
    setPriceRange({ min: priceExtent.min, max: priceExtent.max });
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    sortBy !== "default" ||
    priceRange.min > priceExtent.min ||
    priceRange.max < priceExtent.max;

  if (loading) {
    return (
      <div className="menu-page">
        <div className="menu-header">
          <h1>Our Menu</h1>
          <p>Discover our delicious offerings</p>
        </div>
        <div className="loading-container" style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="loading-spinner" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <p>Loading delicious dishes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Our Menu</h1>
        <p>Discover our delicious offerings</p>
      </div>

      {/* Search and Filter Section */}
      <div className="menu-controls">
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search dishes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="filters-row">
          {/* Category Filter */}
          <div className="filter-group">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all"
                    ? "All Categories"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="filter-group">
            <label htmlFor="sort-filter">Sort By</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group price-filter">
            <label>Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min || ""}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    min: Number(e.target.value) || 0,
                  })
                }
                className="price-input"
                min={0}
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max || ""}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    max: Number(e.target.value) || 1000,
                  })
                }
                className="price-input"
                min={0}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="results-info">
          <span className="results-count">
            {filteredAndSortedItems.length}{" "}
            {filteredAndSortedItems.length === 1 ? "item" : "items"} found
          </span>
          {hasActiveFilters && (
            <span className="active-filters-indicator">• Filters applied</span>
          )}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="menu-content">
        {filteredAndSortedItems.length > 0 ? (
          <div className="menu-grid">
            {filteredAndSortedItems.map((item) => (
              <div key={item.id} className="menu-card">
                <div className="menu-card-image">
                  <img src={item.image} alt={item.name} />
                  {item.isVeg !== undefined && (
                    <span
                      className={`veg-badge ${item.isVeg ? "veg" : "non-veg"}`}
                    >
                      {item.isVeg ? "🟢" : "🔴"}
                    </span>
                  )}
                  {item.rating && (
                    <span className="rating-badge">⭐ {item.rating}</span>
                  )}
                </div>
                <div className="menu-card-content">
                  <span className="menu-card-category">{item.category}</span>
                  <h3 className="menu-card-title">{item.name}</h3>
                  <p className="menu-card-description">{item.description}</p>
                  <div className="menu-card-footer">
                    <span className="menu-card-price">₹{item.price}</span>
                    <div className="menu-card-buttons">
                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="order-now-btn"
                        onClick={() => handleOrderNow(item)}
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🍽️</div>
            <h3>No dishes found</h3>
            <p>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "No items match your filters"}
            </p>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;