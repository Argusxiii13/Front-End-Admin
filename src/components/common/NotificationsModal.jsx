import React, { useState } from 'react';
import { X } from 'lucide-react';

const NotificationsModal = ({ 
    notifications, 
    isOpen, 
    onClose, 
    isLoading, 
    error,
    onMarkAsRead // prop for marking notifications as read
}) => {
    const [selectedNotifications, setSelectedNotifications] = useState([]);

    if (!isOpen) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                    <p className="text-gray-300 text-center">Loading notifications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                    <p className="text-red-500 text-center mb-4">{error}</p>
                    <button 
                        onClick={onClose}
                        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const handleSelectNotification = (m_id) => {
        setSelectedNotifications(prevSelected => 
            prevSelected.includes(m_id)
                ? prevSelected.filter(id => id !== m_id)
                : [...prevSelected, m_id]
        );
    };

    const handleMarkAllAsRead = () => {
        const allNotificationIds = notifications.map(n => n.m_id);
        onMarkAsRead(allNotificationIds);
        setSelectedNotifications([]);
    };

    const handleConfirmMarkAsRead = (m_id) => {
        if (selectedNotifications.includes(m_id)) {
            // Confirm action
            onMarkAsRead([m_id]);
            setSelectedNotifications(prevSelected => prevSelected.filter(id => id !== m_id));
        } else {
            // Select for confirmation
            setSelectedNotifications(prevSelected => [...prevSelected, m_id]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg w-[500px] max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-100">Notifications</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">No unread notifications, proceed to settings to view all existing notifications</div>
                ) : (
                    <div className="overflow-y-auto max-h-[60vh]">
                        {notifications.map((notification) => (
                            <div 
                                key={notification.m_id}
                                className="p-4 border-b border-gray-700 flex justify-between items-center hover:bg-gray-700 transition"
                            >
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-gray-100">{notification.title}</h3>
                                        <span className="text-sm text-gray-400">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-300">{notification.message}</p>
                                    {notification.booking_id && (
                                        <div className="mt-2 text-sm text-gray-400">
                                            Booking ID: {notification.booking_id}
                                        </div>
                                    )}
                                </div>
                                <label className="flex items-center ml-4 w-32"> {/* Fixed width for consistent spacing */}
                                    <input
                                        type="checkbox"
                                        checked={selectedNotifications.includes(notification.m_id)}
                                        onChange={() => handleConfirmMarkAsRead(notification.m_id)}
                                        className="mr-2"
                                    />
                                    <span className="whitespace-nowrap">
                                        {selectedNotifications.includes(notification.m_id) ? "Confirm" : "Mark as Read"}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Mark All as Read Button */}
                <div className="p-4">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        Mark All as Read
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;