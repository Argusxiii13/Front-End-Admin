import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react"; // Assuming you're using lucide-react for icons
import SettingSection from "./SettingSection";
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const getAdminInfo = () => {
    try {
        const storedAdminInfo = localStorage.getItem('adminInfo');
        return storedAdminInfo ? JSON.parse(storedAdminInfo) : null;
    } catch (error) {
        return null;
    }
  };
  
  const adminInfo = getAdminInfo() || {};
  const role = adminInfo.admin_role || 'RAR'; // Provide a default value if role is not found
const Notifications = ({ onViewAll }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${apiUrl}/api/admin/setting/notifications?role=${encodeURIComponent(role)}`);
                setNotifications(response.data.slice(0, 5)); // Display first 5 notifications initially
            } catch (err) {
                setError('Failed to load notifications');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (isLoading) {
        return (
            <SettingSection icon={Bell} title={"Notifications"}>
                <div className="text-gray-400">Loading notifications...</div>
            </SettingSection>
        );
    }

    if (error) {
        return (
            <SettingSection icon={Bell} title={"Notifications"}>
                <div className="text-red-500">{error}</div>
            </SettingSection>
        );
    }

    const truncateMessage = (message) => {
        return message.length > 30 ? `${message.slice(0, 30)}...` : message;
    };

    const formatTimestamp = (timestamp) => {
        const formattedTimestamp = timestamp.replace(/\.\d+/, '');
        const date = new Date(formattedTimestamp);
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
    };

    return (
        <SettingSection icon={Bell} title={"Notifications"}>
            <motion.div
                className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Title</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Message</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Time</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {notifications.map((notification, index) => (
                            <tr key={notification.m_id} className={`${index === 0 ? 'border-t' : ''}`}>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{notification.title}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{truncateMessage(notification.message)}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {formatTimestamp(notification.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className='mt-4'>
                    <button
                        className='bg-blue-500 text-white px-4 py-2 rounded-md'
                        onClick={onViewAll}
                    >
                        View All Notifications
                    </button>
                </div>
            </motion.div>
        </SettingSection>
    );
};

export default Notifications;
