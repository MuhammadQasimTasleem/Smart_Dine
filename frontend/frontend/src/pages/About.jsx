import React from 'react';
import '../styles/about.css';

const About = () => {
    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1>About Smart Dine</h1>
                    <p>Where Culinary Excellence Meets Warm Hospitality</p>
                </div>
            </section>

            {/* Story Section */}
            <section className="about-section story-section">
                <div className="section-content">
                    <div className="section-text">
                        <span className="section-tag">Our Story</span>
                        <h2>A Journey of Flavors</h2>
                        <p>
                            Founded in 2020, Smart Dine was born from a simple vision: to create 
                            extraordinary dining experiences that bring people together. What started 
                            as a small family kitchen has grown into a beloved destination for food lovers.
                        </p>
                        <p>
                            Our passion for authentic flavors and quality ingredients drives everything 
                            we do. From sourcing the freshest local produce to crafting each dish with care, 
                            we're committed to excellence in every bite.
                        </p>
                    </div>
                    <div className="section-image">
                        <img 
                            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600" 
                            alt="Restaurant Interior" 
                        />
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-section values-section">
                <div className="section-header">
                    <span className="section-tag">Our Values</span>
                    <h2>What We Stand For</h2>
                </div>
                <div className="values-grid">
                    <div className="value-card">
                        <span className="value-icon">🍳</span>
                        <h3>Quality First</h3>
                        <p>We use only the finest ingredients to create dishes that exceed expectations.</p>
                    </div>
                    <div className="value-card">
                        <span className="value-icon">❤️</span>
                        <h3>Made with Love</h3>
                        <p>Every dish is prepared with passion and attention to detail.</p>
                    </div>
                    <div className="value-card">
                        <span className="value-icon">🌿</span>
                        <h3>Fresh & Local</h3>
                        <p>We source locally to support our community and ensure freshness.</p>
                    </div>
                    <div className="value-card">
                        <span className="value-icon">⭐</span>
                        <h3>Excellence</h3>
                        <p>From our kitchen to your table, excellence is our standard.</p>
                    </div>
                </div>
            </section>

            {/* Chef Section */}
            <section className="about-section chef-section">
                <div className="section-content reverse">
                    <div className="section-image">
                        <img 
                            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600" 
                            alt="Our Chef" 
                        />
                    </div>
                    <div className="section-text">
                        <span className="section-tag">Meet Our Chef</span>
                        <h2>Chef Ahmed Hassan</h2>
                        <p>
                            With over 15 years of culinary expertise and training from renowned 
                            international kitchens, Chef Ahmed brings a unique fusion of traditional 
                            and contemporary flavors to Smart Dine.
                        </p>
                        <p>
                            His philosophy: "Food is not just about taste—it's about creating 
                            memories that last a lifetime."
                        </p>
                        <div className="chef-signature">
                            <span>Chef Ahmed Hassan</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-number">5+</span>
                        <span className="stat-label">Years of Excellence</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">50K+</span>
                        <span className="stat-label">Happy Customers</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">100+</span>
                        <span className="stat-label">Menu Items</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">4.9</span>
                        <span className="stat-label">Customer Rating</span>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="about-section contact-section">
                <div className="section-header">
                    <span className="section-tag">Get in Touch</span>
                    <h2>Visit Us Today</h2>
                </div>
                <div className="contact-grid">
                    <div className="contact-card">
                        <span className="contact-icon">📍</span>
                        <h3>Location</h3>
                        <p>123 Food Street, Gulberg III<br />Lahore, Pakistan</p>
                    </div>
                    <div className="contact-card">
                        <span className="contact-icon">📞</span>
                        <h3>Phone</h3>
                        <p>+92 300 1234567<br />+92 42 35761234</p>
                    </div>
                    <div className="contact-card">
                        <span className="contact-icon">⏰</span>
                        <h3>Hours</h3>
                        <p>Mon - Sun: 11:00 AM - 11:00 PM<br />Open 7 Days a Week</p>
                    </div>
                    <div className="contact-card">
                        <span className="contact-icon">✉️</span>
                        <h3>Email</h3>
                        <p>info@smartdine.com<br />support@smartdine.com</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;