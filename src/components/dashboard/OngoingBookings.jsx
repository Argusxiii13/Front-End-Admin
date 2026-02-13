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
        return null;
    }
};

const adminInfo = getAdminInfo() || {};

// Extract the role
const role = adminInfo.admin_role || 'RAR'; // Provide a default value if role is not found

const OngoingBookings = () => {
    const rowsPerPage = 4;
    const [bookings, setBookings] = useState([]);
    const [cars, setCars] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const bookingResponse = await axios.get(`${apiUrl}/api/admin/dashboard/booking-today?role=${encodeURIComponent(role)}`);
                const bookingData = bookingResponse.data;
                setBookings(bookingData);
                if (Array.isArray(bookingData) && bookingData.length === 0) {
                } else {
                    const count = Array.isArray(bookingData) ? bookingData.length : 'non-array';
                }
            } catch (err) {
                setError('Failed to load bookings');
            }
        };

        const fetchCars = async () => {
            try {
                const carResponse = await axios.get(`${apiUrl}/api/admin/dashboard/cars-details?role=${encodeURIComponent(role)}`);
                const carsData = carResponse.data;
                setCars(carsData);
                if (Array.isArray(carsData) && carsData.length === 0) {
                } else {
                    const count = Array.isArray(carsData) ? carsData.length : 'non-array';
                }
            } catch (err) {
                setError('Failed to load car details');
            }
        };

        Promise.all([fetchBookings(), fetchCars()])
            .then(() => setIsLoading(false))
            .catch(() => setIsLoading(false));
    }, []);

    const filteredBookings = bookings.filter(booking =>
        booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastBooking = currentPage * rowsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - rowsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
    const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);
    const placeholderRowsCount = rowsPerPage - currentBookings.length;
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
                <div className="text-gray-400">Loading bookings...</div>
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
                <h2 className="text-lg font-medium text-gray-100">Ongoing Bookings Today</h2>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Driver Assigned</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {currentBookings.map((booking, index) => {
                        const car = cars.find(car => car.id === booking.car_id);
                        return (
                            <tr key={booking.booking_id} className={`${index === 0 ? 'border-t' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{booking.booking_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{car ? car.plate_num : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{car ? car.driver : 'N/A'}</td>
                            </tr>
                        );
                    })}
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

export default OngoingBookings;
