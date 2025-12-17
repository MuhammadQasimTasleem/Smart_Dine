import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedMenu from '../components/home/FeaturedMenu';
import Testimonials from '../components/home/Testimonials';

const Home = () => {
    return (
        <div>
            <Hero />
            <FeaturedMenu />
            <Testimonials />
        </div>
    );
};

export default Home;