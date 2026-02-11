import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const FinishModal = ({ isOpen, onConfirm, onCancel }) => {
    const [totalExpenses, setTotalExpenses] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTotalExpenses('');
            setErrorMessage(''); // Clear any previous error messages
            setIsConfirmDisabled(false); // Reset button state
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const trimmedTotal = totalExpenses.trim();
        if (!trimmedTotal) {
            setErrorMessage('Please provide total expenses');
            return;
        }
    
        onConfirm(trimmedTotal); // Call the onConfirm function with total expenses
        setTotalExpenses(''); // Reset expenses after confirmation
        setErrorMessage(''); // Clear error after successful confirmation
        onCancel(); // Close the modal immediately
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
                <h2 className="modal-title">Total Expenses</h2>
                <input
                    type="number"
                    className="modal-input"
                    placeholder="Enter total expenses"
                    value={totalExpenses}
                    onChange={(e) => setTotalExpenses(e.target.value)}
                    required
                />
                {errorMessage && <p className="text-red-500">{errorMessage}</p>} {/* Inline error message */}
                <div className="flex justify-end space-x-2">
                    <button
                        className={`modal-button-green ${isConfirmDisabled || !totalExpenses.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled || !totalExpenses.trim()}
                    >
                        Confirm Expenses
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

export default FinishModal;