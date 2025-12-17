import React from 'react';
import '../../styles/card.css';

const Card = ({ title, description, image, onClick }) => {
    return (
        <div className="card" onClick={onClick}>
            {image && <img src={image} alt={title} className="card-image" />}
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-description">{description}</p>
            </div>
        </div>
    );
};

export default Card;