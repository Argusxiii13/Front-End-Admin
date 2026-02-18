import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import NotificationsModal from './NotificationsModal';
import { getSocket } from '../../lib/socket';

const getAdminInfo = () => {
    try {
        const storedAdminInfo = localStorage.getItem('adminInfo');
        return storedAdminInfo ? JSON.parse(storedAdminInfo) : null;
    } catch (error) {
        return null;
    }
};

const adminInfo = getAdminInfo() || {};
const role = adminInfo.admin_role || 'RAR';
const apiUrl = import.meta.env.VITE_API_URL;

const Header = ({ title }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch notifications function with retry logic
    const fetchNotifications = async (retries = 2) => {
        setIsLoading(true);
        setError(null);
        let attempt = 0;

        while (attempt <= retries) {
            try {
                const response = await axios.get(`${apiUrl}/api/admin/settings/notifications?role=${encodeURIComponent(role)}`);
                const fetchedNotifications = response.data;

                // Filter unread notifications
                const unreadNotifications = fetchedNotifications.filter(notification => !notification.read);
                setNotifications(unreadNotifications);

                // Update unread notifications count
                setUnreadCount(unreadNotifications.length);
                setIsLoading(false);
                return;
            } catch (err) {
                if (attempt === retries) {
                    setError('Failed to fetch notifications. Please try again.');
                    setIsLoading(false);
                    return;
                }
                attempt++;
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
            }
        }
    };

    // Mark as read function with retry logic
    const handleMarkAsRead = async (ids) => {
        try {
            const response = await axios.post(`${apiUrl}/api/admin/settings/notifications/mark-as-read?role=${encodeURIComponent(role)}`, { ids });
            
            if (response.status === 200) {
                fetchNotifications(); // Refetch notifications to get the updated list
            } else {
                throw new Error('Failed to mark notifications as read');
            }
        } catch (err) {
            console.error('Error marking notifications as read:', err);
        }
    };

    // Open notifications function
    const handleOpenNotifications = () => {
        setIsNotificationsOpen(true);
        fetchNotifications(); // Fetch notifications when opening the modal
    };

    // Close notifications function
    const handleCloseNotifications = () => {
        setIsNotificationsOpen(false);
    };

    // Set up real-time socket.io updates and fallback polling
    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Set up socket.io for real-time updates
        const socket = getSocket();
        const adminId = adminInfo.admin_id || adminInfo.id;
        
        if (adminId) {
            socket.emit('join-admin-room', adminId);

            const onRealtimeUpdate = (payload) => {
                if (!payload || String(payload.admin_id) !== String(adminId)) return;
                fetchNotifications();
            };

            socket.on('admin:notification-update', onRealtimeUpdate);

            return () => {
                socket.off('admin:notification-update', onRealtimeUpdate);
            };
        }
    }, []);

    // Fallback polling interval for reliability
    useEffect(() => {
        // Set up fallback interval to fetch notifications every 10 seconds for reliability
        const intervalId = setInterval(() => {
            if (!isNotificationsOpen) {
                fetchNotifications();
            }
        }, 10000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [isNotificationsOpen]);

    return (
        <>
            <header className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700 relative'>
                <div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
                    <h1 className='text-2xl font-semibold text-gray-100'>{title}</h1>
                    <button 
                        onClick={handleOpenNotifications} // Open modal when clicked
                        className='text-gray-300 hover:text-white transition-colors duration-200 relative'
                    >
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>
            
            <NotificationsModal
                notifications={notifications}
                isOpen={isNotificationsOpen}
                onClose={handleCloseNotifications}
                isLoading={isLoading}
                error={error}
                onMarkAsRead={handleMarkAsRead} // Pass the function
            />
        </>
    );
};

export default Header;
