import React from 'react';
import '../../styles/cart.css';

const CartItem = ({ item, onRemove }) => {
    return (
        <div className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-details">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">${item.price.toFixed(2)}</p>
                <p className="cart-item-quantity">Quantity: {item.quantity}</p>
            </div>
            <button className="cart-item-remove" onClick={() => onRemove(item.id)}>
                Remove
            </button>
        </div>
    );
};

export default CartItem;