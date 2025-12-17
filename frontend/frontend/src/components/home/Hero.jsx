import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1>Welcome to <span>Smart Dine</span></h1>
                <p>Experience the finest cuisine with our easy reservation and online ordering system.</p>
                <div className="hero-buttons">
                    <Link to="/menu" className="hero-btn primary">Order Now</Link>
                    <Link to="/book-table" className="hero-btn secondary">Book a Table</Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;