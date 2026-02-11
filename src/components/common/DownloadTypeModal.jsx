import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

const DownloadTypeModal = ({ isOpen, onClose, onDownload }) => {
    if (!isOpen) return null;

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onKeyDown={handleKeyDown}
            tabIndex={-1} // Make div focusable
        >
            <div 
                className="bg-gray-800 rounded-lg p-6 w-96 relative"
                role="dialog"
                aria-modal="true"
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
                >
                    <X size={24} />
                </button>
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Select Download Format</h2>
                <div className="flex justify-between space-x-4">
                    <button 
                        onClick={() => onDownload('csv')}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                    >
                        CSV (.csv)
                    </button>
                    <button 
                        onClick={() => onDownload('xlsx')}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                    >
                        Excel (.xlsx)
                    </button>
                </div>
            </div>
        </div>,
        document.body // Render the modal into the body
    );
};

export default DownloadTypeModal;