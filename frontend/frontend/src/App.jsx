import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import BookTable from './pages/BookTable';
import OrderOnline from './pages/OrderOnline';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrderNow from './pages/OrderNow';

// Admin Panel
import { AdminProvider } from './admin/context/AdminContext';
import AdminRoute from './admin/components/AdminRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import ManageMenu from './admin/pages/ManageMenu';
import ManageOrders from './admin/pages/ManageOrders';
import ManageReservations from './admin/pages/ManageReservations';
import ManageUsers from './admin/pages/ManageUsers';
import Reports from './admin/pages/Reports';

import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <OrderProvider>
                        <AdminProvider>
                            <Routes>
                                {/* Admin Routes - No Navbar/Footer */}
                                <Route path="/admin/login" element={<AdminLogin />} />
                                <Route path="/admin" element={
                                    <AdminRoute>
                                        <AdminLayout />
                                    </AdminRoute>
                                }>
                                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="menu" element={<ManageMenu />} />
                                    <Route path="orders" element={<ManageOrders />} />
                                    <Route path="reservations" element={<ManageReservations />} />
                                    <Route path="users" element={<ManageUsers />} />
                                    <Route path="reports" element={<Reports />} />
                                </Route>

                                {/* User Routes - With Navbar/Footer */}
                                <Route path="/*" element={
                                    <div className="app">
                                        <Navbar />
                                        <main className="main-content">
                                            <Routes>
                                                <Route path="/" element={<Home />} />
                                                <Route path="/menu" element={<Menu />} />
                                                <Route path="/about" element={<About />} />
                                                <Route path="/book-table" element={<BookTable />} />
                                                <Route path="/order-online" element={<OrderOnline />} />
                                                <Route path="/cart" element={<Cart />} />
                                                <Route path="/checkout" element={<Checkout />} />
                                                <Route path="/login" element={<Login />} />
                                                <Route path="/register" element={<Register />} />
                                                <Route path="/profile" element={<Profile />} />
                                                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                                <Route path="/order-now" element={<OrderNow />} />
                                                <Route path="/payment-success" element={<PaymentSuccess />} />
                                                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                                                <Route path="*" element={<NotFound />} />
                                            </Routes>
                                        </main>
                                        <Footer />
                                    </div>
                                } />
                            </Routes>
                        </AdminProvider>
                    </OrderProvider>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;