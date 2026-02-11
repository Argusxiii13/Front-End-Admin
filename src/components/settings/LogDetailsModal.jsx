import React from "react";

const LogDetailsModal = ({ log, onClose }) => {
    if (!log) return null;

    // Function to format log details
    const formatLogDetail = (key, value) => {
        // Limit to 5000 characters
        const maxLength = 5000;
        
        if (typeof value === 'string') {
            return value.length > maxLength 
                ? `${value.substring(0, maxLength)}... (truncated)` 
                : value;
        } else if (Buffer.isBuffer(value)) {
            return 'Binary data (not displayed)';
        } else if (typeof value === 'object') {
            const jsonString = JSON.stringify(value, null, 2);
            return jsonString.length > maxLength 
                ? `${jsonString.substring(0, maxLength)}... (truncated)` 
                : jsonString;
        }
        return value; // Return as is for other types
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[200]">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 text-left">
                <h3 className="text-lg font-bold text-gray-100 mb-4">Log Details</h3>
                <div className="text-gray-300">
                    <p><strong>ID:</strong> {log.id}</p>
                    <p><strong>Admin:</strong> {log.admin_name}</p>
                    <p><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                    <p><strong>Action:</strong> {log.action}</p>
                    <p><strong>Role:</strong> {log.admin_role}</p>
                    <p><strong>Details:</strong></p>
                    <pre className="whitespace-pre-wrap">
                        {Object.entries(log.details).map(([key, value]) => (
                            <div key={key}>
                                <strong>{key}:</strong> {formatLogDetail(key, value)}
                            </div>
                        ))}
                    </pre>
                </div>
                <button
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-4"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default LogDetailsModal;