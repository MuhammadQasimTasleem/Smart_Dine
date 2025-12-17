import React from 'react';
import '../../styles/variables.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">{title}</h2>
                <button className="modal-close" onClick={onClose}>
                    &times;
                </button>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;