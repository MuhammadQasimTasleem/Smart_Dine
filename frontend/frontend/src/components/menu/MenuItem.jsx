import React from 'react';
import '../../styles/menu.css';

const MenuItem = ({ item, onAddToCart }) => {
    return (
        <div className="menu-item">
            <img src={item.image} alt={item.name} className="menu-item-image" />
            <h3 className="menu-item-name">{item.name}</h3>
            <p className="menu-item-description">{item.description}</p>
            <span className="menu-item-price">${item.price.toFixed(2)}</span>
            <button className="add-to-cart-button" onClick={() => onAddToCart(item)}>
                Add to Cart
            </button>
        </div>
    );
};

export default MenuItem;