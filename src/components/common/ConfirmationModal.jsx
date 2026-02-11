import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
    const [isConfirming, setIsConfirming] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsConfirming(true);
            setLoadingMessage('Please wait...');

            const timer = setTimeout(() => {
                setIsConfirming(false);
                setLoadingMessage('');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!isConfirming) {
            await onConfirm();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <motion.div
                className="modal-content modal-content-small"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
            >
                <h2 className="modal-title">{message}</h2>
                <div className="flex justify-end space-x-2">
                    <button
                        className={`modal-button-green ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleConfirm}
                        disabled={isConfirming}
                    >
                        {isConfirming ? loadingMessage : 'Confirm'}
                    </button>
                    <button
                        className="modal-button-red"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ConfirmationModal;