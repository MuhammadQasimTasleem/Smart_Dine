import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMenuItems } from '../../services/menuService';
import { useCart } from '../../context/CartContext';
import '../../styles/featuredMenu.css';

const FeaturedMenu = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeaturedItems = async () => {
      try {
        const data = await fetchMenuItems();
        // Get featured items or first 6 items
        const featured = data.filter(item => item.is_featured).slice(0, 6);
        setFeaturedItems(featured.length > 0 ? featured : data.slice(0, 6));
      } catch (error) {
        console.error("Error loading featured items:", error);
        setFeaturedItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedItems();
  }, []);

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  const handleOrderNow = (item) => {
    // Redirect to order form page with item details (don't add to cart)
    navigate("/order-now", { state: { item } });
  };

  if (loading) {
    return (
      <section className="featured-menu">
        <div className="featured-header">
          <h2>Featured Menu</h2>
          <p>Discover our chef's specially curated dishes</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </section>
    );
  }

  return (
    <section className="featured-menu">
      <div className="featured-header">
        <h2>Featured Menu</h2>
        <p>Discover our chef's specially curated dishes</p>
      </div>
      <div className="featured-grid">
        {featuredItems.map((item, index) => (
          <div 
            key={item.id} 
            className="featured-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="featured-image-wrapper">
              <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name} />
              <div className="featured-overlay">
                <span className="category-tag">{item.category_name || item.category}</span>
                {(item.isVeg !== undefined || item.is_veg !== undefined) && (
                  <span className={`veg-indicator ${item.isVeg || item.is_veg ? 'veg' : 'non-veg'}`}>
                    {item.isVeg || item.is_veg ? '🟢' : '🔴'}
                  </span>
                )}
              </div>
            </div>
            <div className="featured-content">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="featured-footer">
                <span className="price">₹{item.price}</span>
                <div className="featured-buttons">
                  <button 
                    className="add-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="order-btn"
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
      <Link to="/menu" className="view-all-btn">
        <span>View Full Menu</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </Link>
    </section>
  );
};

export default FeaturedMenu;