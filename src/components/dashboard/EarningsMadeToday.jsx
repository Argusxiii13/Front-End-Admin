import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import axios from 'axios';
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

// Extract the role
const role = adminInfo.admin_role || 'RAR'; // Provide a default value if role is not found


const EarningsMadeToday = () => {
    const rowsPerPage = 4;
    const [earnings, setEarnings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/admin/dashboard/earnings-today`);
                setEarnings(response.data);
            } catch (err) {
                console.error('Error fetching earnings:', err);
                setError('Failed to load earnings');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEarnings();
    }, []);

    const filteredEarnings = earnings.filter(earning =>
        earning.booking_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastEarning = currentPage * rowsPerPage;
    const indexOfFirstEarning = indexOfLastEarning - rowsPerPage;
    const currentEarnings = filteredEarnings.slice(indexOfFirstEarning, indexOfLastEarning);
    const totalPages = Math.ceil(filteredEarnings.length / rowsPerPage);
    const placeholderRowsCount = rowsPerPage - currentEarnings.length;
    const placeholderRows = Array(placeholderRowsCount).fill(null);

    const handleSearchClose = () => {
        setIsSearchOpen(false);
        // Delay clearing the search term until after the animation completes
        setTimeout(() => {
            setSearchTerm("");
            setCurrentPage(1);
        }, 300);
    };

    if (isLoading) {
        return (
            <motion.div
                className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="text-gray-400">Loading earnings...</div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="text-red-500">{error}</div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-100">Earnings Made Today</h2>
                <div className="relative flex items-center h-10"> {/* Fixed height container */}
                    <AnimatePresence mode="wait">
                        {isSearchOpen ? (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "300px", opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ 
                                    duration: 0.3,
                                    opacity: { duration: 0.2 }
                                }}
                                className="flex items-center"
                            >
                                <motion.div 
                                    className="flex items-center w-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Search bookings by ID..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full h-10 px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-gray-200"
                                    />
                                    <motion.button
                                        onClick={handleSearchClose}
                                        className="ml-2 h-10 w-10 flex items-center justify-center text-gray-400 hover:text-gray-200"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <X size={20} />
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSearchOpen(true)}
                                className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-gray-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Search size={20} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <table className="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Booking ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plate Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Earnings</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {currentEarnings.map((earning, index) => (
                        <tr key={earning.booking_id} className={`${index === 0 ? 'border-t' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{earning.booking_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{earning.plate_num}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">${earning.price.toFixed(2)}</td>
                        </tr>
                    ))}
                    {placeholderRows.map((_, index) => (
                        <tr key={`placeholder-${index}`} className="h-[53px]">
                            <td colSpan="3"></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </motion.div>
    );
};

export default EarningsMadeToday;