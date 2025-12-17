import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <OrderProvider>
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
                    </OrderProvider>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;