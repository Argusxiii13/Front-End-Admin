import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PriceModal = ({ isOpen, onConfirm, onCancel, updatePrice, booking}) => {
    const [price, setPrice] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPrice('');
            setErrorMessage(''); // Clear any previous error messages
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const trimmedPrice = price.trim();
        if (!trimmedPrice || isNaN(trimmedPrice) || parseFloat(trimmedPrice) <= 0) {
            setErrorMessage('Please provide a valid price greater than zero');
            return;
        }

        onConfirm(parseFloat(trimmedPrice));
        setPrice('');
        setErrorMessage(''); // Clear error after successful confirmation
        updatePrice(updatePrice);
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
                <h2 className="modal-title">Set Price</h2>
                <input
                    type="number"
                    className="modal-input" // Consistent styling
                    placeholder="Enter the price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
                {errorMessage && <p className="text-red-500">{errorMessage}</p>} {/* Inline error message */}
                <div className="flex justify-end space-x-2">
                    <button
                        className={`modal-button-green ${!price.trim() || isNaN(price) || parseFloat(price) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleConfirm}
                        disabled={!price.trim() || isNaN(price) || parseFloat(price) <= 0 || booking.price != 0}
                    >
                        Confirm Price
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

export default PriceModal;