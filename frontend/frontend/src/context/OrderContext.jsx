import React, { createContext, useState, useContext } from 'react';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);

    const addOrder = (order) => {
        setOrders([...orders, order]);
    };

    const updateOrder = (orderId, updatedOrder) => {
        setOrders(orders.map(order => (order.id === orderId ? updatedOrder : order)));
    };

    const removeOrder = (orderId) => {
        setOrders(orders.filter(order => order.id !== orderId));
    };

    const value = {
        orders,
        currentOrder,
        setCurrentOrder,
        addOrder,
        updateOrder,
        removeOrder,
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
    return useContext(OrderContext);
};