import React, { useContext, useEffect, useState } from 'react';
import { OrderContext } from '../../context/OrderContext';
import Loader from '../common/Loader';
import '../../styles/order.css';

const OrderHistory = () => {
    const { fetchOrderHistory } = useContext(OrderContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getOrderHistory = async () => {
            setLoading(true);
            const orderData = await fetchOrderHistory();
            setOrders(orderData);
            setLoading(false);
        };

        getOrderHistory();
    }, [fetchOrderHistory]);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="order-history">
            <h2>Your Order History</h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <ul>
                    {orders.map((order) => (
                        <li key={order.id}>
                            <h3>Order #{order.id}</h3>
                            <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                            <p>Total: ${order.total.toFixed(2)}</p>
                            <p>Status: {order.status}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OrderHistory;