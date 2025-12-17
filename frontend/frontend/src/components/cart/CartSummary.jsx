import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import '../../styles/cart.css';

const CartSummary = () => {
    const { cartItems, totalAmount } = useContext(CartContext);

    return (
        <div className="cart-summary">
            <h2>Cart Summary</h2>
            <div className="summary-details">
                <p>Total Items: {cartItems.length}</p>
                <p>Total Amount: ${totalAmount.toFixed(2)}</p>
            </div>
            <button className="checkout-button">Proceed to Checkout</button>
        </div>
    );
};

export default CartSummary;