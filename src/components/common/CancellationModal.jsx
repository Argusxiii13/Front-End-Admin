import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CancellationModal = ({ isOpen, onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setErrorMessage(''); // Clear any previous error messages
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const trimmedReason = reason.trim();
        if (!trimmedReason) {
            setErrorMessage('Please provide a cancellation reason');
            return;
        }

        onConfirm(trimmedReason);
        setReason('');
        setErrorMessage(''); // Clear error after successful confirmation
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
                <h2 className="modal-title">Cancel Booking</h2>
                <textarea
                    className="modal-input modal-textarea" // Use the modal-input class for consistency
                    placeholder="Provide a reason for cancellation"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                />
                {errorMessage && <p className="text-red-500">{errorMessage}</p>} {/* Inline error message */}
                <div className="flex justify-end space-x-2">
                    <button
                        className={`modal-button-green ${!reason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleConfirm}
                        disabled={!reason.trim()}
                    >
                        Confirm Cancellation
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

export default CancellationModal;