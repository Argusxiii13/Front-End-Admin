// Modal.jsx
import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 relative w-11/12 md:w-3/4 lg:w-2/3">
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;