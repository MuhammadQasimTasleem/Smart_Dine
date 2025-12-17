import React, { useState, useContext } from 'react';
import { OrderContext } from '../../context/OrderContext';
import '../../styles/order.css';

const OrderForm = () => {
    const { placeOrder } = useContext(OrderContext);
    const [formData, setFormData] = useState({
        customerName: '',
        address: '',
        items: [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        placeOrder(formData);
        setFormData({
            customerName: '',
            address: '',
            items: [],
        });
    };

    return (
        <form className="order-form" onSubmit={handleSubmit}>
            <h2>Place Your Order</h2>
            <div className="form-group">
                <label htmlFor="customerName">Name:</label>
                <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="address">Address:</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="items">Items:</label>
                <textarea
                    id="items"
                    name="items"
                    value={formData.items.join(', ')}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">Submit Order</button>
        </form>
    );
};

export default OrderForm;