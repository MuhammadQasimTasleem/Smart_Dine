import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import '../../styles/cart.css';

const Cart = () => {
    const { cartItems } = useContext(CartContext);

    return (
        <div className="cart-container">
            <h1>Your Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty. Start adding items!</p>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>
                    <CartSummary />
                </>
            )}
        </div>
    );
};

export default Cart;