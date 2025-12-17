import React, { useContext, useEffect, useState } from 'react';
import { OrderContext } from '../../context/OrderContext';
import Loader from '../common/Loader';
import '../../styles/order.css';

const OrderTracking = () => {
    const { currentOrder, fetchOrderStatus } = useContext(OrderContext);
    const [loading, setLoading] = useState(true);
    const [orderStatus, setOrderStatus] = useState(null);

    useEffect(() => {
        const getOrderStatus = async () => {
            setLoading(true);
            const status = await fetchOrderStatus(currentOrder.id);
            setOrderStatus(status);
            setLoading(false);
        };

        if (currentOrder) {
            getOrderStatus();
        }
    }, [currentOrder, fetchOrderStatus]);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="order-tracking">
            <h2>Order Tracking</h2>
            {orderStatus ? (
                <div className="order-status">
                    <h3>Order ID: {currentOrder.id}</h3>
                    <p>Status: {orderStatus}</p>
                </div>
            ) : (
                <p>No current order found.</p>
            )}
        </div>
    );
};

export default OrderTracking;