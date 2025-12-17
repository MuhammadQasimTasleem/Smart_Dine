import React from 'react';
import '../../styles/testimonials.css';

const testimonialsData = [
    {
        id: 1,
        name: "Ahmed Khan",
        feedback: "The food was amazing and the service was excellent! Best biryani I've ever had.",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        rating: 5
    },
    {
        id: 2,
        name: "Sarah Ali",
        feedback: "A wonderful dining experience! The ambiance is perfect for family dinners.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        rating: 5
    },
    {
        id: 3,
        name: "Usman Malik",
        feedback: "Great atmosphere and delicious desserts! Will definitely come back.",
        image: "https://randomuser.me/api/portraits/men/67.jpg",
        rating: 4
    }
];

const Testimonials = () => {
    return (
        <section className="testimonials">
            <h2>What Our Customers Say</h2>
            <div className="testimonial-list">
                {testimonialsData.map(testimonial => (
                    <div key={testimonial.id} className="testimonial-card">
                        <img src={testimonial.image} alt={testimonial.name} />
                        <div className="testimonial-rating">
                            {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                        </div>
                        <p>{testimonial.feedback}</p>
                        <h3>{testimonial.name}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;