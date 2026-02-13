import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import Header from "../components/common/Header";
import ConnectedAccounts from "../components/settings/ConnectedAccounts";
import DangerZone from "../components/settings/DangerZone";
import Notifications from "../components/settings/Notifications";
import Profile from "../components/settings/Profile";
import Security from "../components/settings/Security";
import SecurityLog from "../components/settings/SecurityLog";
import NotificationsModal from "../components/settings/NotificationsModal"; // Import the notifications modal
import AdminUsersManagement from '../components/settings/AdminUsersManagement';

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
const role = adminInfo.admin_role || 'RAR';

const SettingsPage = () => {
    const [securityLogs, setSecurityLogs] = useState([]);
    const [notifications, setNotifications] = useState([]); // State for notifications
    const [isSecurityLogModalOpen, setIsSecurityLogModalOpen] = useState(false);
    const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false); // State for notifications modal
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAllLogs = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${apiUrl}/api/admin/setting/audit-logs?role=${encodeURIComponent(role)}`);
            setSecurityLogs(response.data);
            setIsSecurityLogModalOpen(true);
        } catch (err) {
            setError('Failed to load security logs');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${apiUrl}/api/admin/setting/notifications?role=${encodeURIComponent(role)}`);
            setNotifications(response.data);
            setIsNotificationsModalOpen(true);
        } catch (err) {
            setError('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenSecurityLogs = () => {
        fetchAllLogs();
    };

    const handleOpenNotifications = () => {
        fetchNotifications();
    };

    const handleCloseSecurityLogs = () => {
        setIsSecurityLogModalOpen(false);
    };

    const handleCloseNotifications = () => {
        setIsNotificationsModalOpen(false);
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title='Settings' />
            <main className='max-w-4xl mx-auto py-6 px-4 lg:px-8'>
                <Profile />
                
                {/* Only render AdminUsersManagement for "Developer" role */}
                {role === 'Owner' && <AdminUsersManagement />}
                
                <Notifications onViewAll={handleOpenNotifications} />
                <Security onViewLogs={handleOpenSecurityLogs} />
            </main>

            {/* Portal for security logs modal */}
            {isSecurityLogModalOpen && createPortal(
                <SecurityLog 
                    logs={securityLogs} 
                    isOpen={isSecurityLogModalOpen} 
                    onClose={handleCloseSecurityLogs}
                    isLoading={isLoading}
                    error={error}
                />,
                document.body
            )}

            {/* Portal for notifications modal */}
            {isNotificationsModalOpen && createPortal(
                <NotificationsModal 
                    notifications={notifications}
                    isOpen={isNotificationsModalOpen} 
                    onClose={handleCloseNotifications}
                    isLoading={isLoading}
                    error={error}
                />,
                document.body
            )}
        </div>
    );
};

export default SettingsPage;
