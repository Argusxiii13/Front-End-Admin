import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react"; // Assuming you have a Users icon
import SettingSection from "./SettingSection";
import axios from 'axios';
import AdminsTable from './AdminsTable'; // Import the AdminsTable component
import Modal from './Modal'; // Import the Modal component

const apiUrl = import.meta.env.VITE_API_URL;

const getAdminInfo = () => {
    try {
        const storedAdminInfo = localStorage.getItem('adminInfo');
        return storedAdminInfo ? JSON.parse(storedAdminInfo) : null;
    } catch (error) {
        console.error('Error parsing admin info:', error);
        return null;
    }
};

const adminInfo = getAdminInfo() || {};
const role = adminInfo.admin_role || 'RAR';

const AdminUsersManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewAll, setViewAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/admin/admins?role=${encodeURIComponent(role)}`);
                setAdmins(response.data);
            } catch (err) {
                console.error('Error fetching admin users:', err);
                setError('Failed to load admin users');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdmins();
    }, []);

    if (isLoading) {
        return (
            <SettingSection icon={Users} title={"Admin Users Management"}>
                <div className="text-gray-400">Loading admins...</div>
            </SettingSection>
        );
    }

    if (error) {
        return (
            <SettingSection icon={Users} title={"Admin Users Management"}>
                <div className="text-red-500">{error}</div>
            </SettingSection>
        );
    }

    const handleViewAll = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <SettingSection icon={Users} title={"Admin Users Management"}>
            <motion.div
                className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Role</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {admins.slice(0, 5).map((admin) => (
                            <tr key={admin.id}>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{admin.role}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{admin.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className='mt-4'>
                    <button
                        className='bg-blue-500 text-white px-4 py-2 rounded-md'
                        onClick={handleViewAll}
                    >
                        View All Users
                    </button>
                </div>
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <AdminsTable />
            </Modal>
        </SettingSection>
    );
};

export default AdminUsersManagement;