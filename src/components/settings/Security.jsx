import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
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
const Security = ({ onViewLogs }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${apiUrl}/api/admin/setting/audit-logs?role=${encodeURIComponent(role)}`);
                setLogs(response.data.slice(0, 5)); // Display first 5 logs initially
            } catch (err) {
                setError('Failed to load security logs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (isLoading) {
        return (
            <SettingSection icon={Lock} title={"Security Logs"}>
                <div className="text-gray-400">Loading logs...</div>
            </SettingSection>
        );
    }

    if (error) {
        return (
            <SettingSection icon={Lock} title={"Security Logs"}>
                <div className="text-red-500">{error}</div>
            </SettingSection>
        );
    }

    return (
        <SettingSection icon={Lock} title={"Security Logs"}>
            <motion.div
                className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Admin</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Timestamp</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Action</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {logs.map((log, index) => (
                            <tr key={log.id} className={`${index === 0 ? 'border-t' : ''}`}>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{log.admin_name}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{log.action}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className='mt-4'>
                    <button
                        className='bg-blue-500 text-white px-4 py-2 rounded-md'
                        onClick={onViewLogs}
                    >
                        View All Logs
                    </button>
                </div>
            </motion.div>
        </SettingSection>
    );
};

export default Security;
