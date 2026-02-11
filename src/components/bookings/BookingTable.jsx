import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Edit, Search, Eye, ArrowUp, ArrowDown, Download, X } from 'lucide-react';
import BookingDetailsModal from './BookingDetailsModal';
import BookingModifyModal from './BookingModifyModal';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DownloadTypeModal from '../common/DownloadTypeModal'; // Import the new modal

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
const role = adminInfo.admin_role || 'RAR'; // Provide a default value if role is not found

const BookingTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isModifyModalOpen, setModifyModalOpen] = useState(false);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    

    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'ascending'
    });

    const rowsPerPage = 8;

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/booking/bookings-table?role=${encodeURIComponent(role)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setBookings(data);
            setFilteredBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getUTCFullYear();
        
        const hours = String(date.getUTCHours()).padStart(2, '0'); // Get hours in UTC
        const minutes = String(date.getUTCMinutes()).padStart(2, '0'); // Get minutes in UTC
        const seconds = String(date.getUTCSeconds()).padStart(2, '0'); // Get seconds in UTC
        
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const downloadAsExcel = () => {
        try {
            // Create a new workbook and add a worksheet
            const workbook = XLSX.utils.book_new();
            const headers = [
                'Booking ID',
                'User ID',
                'Pickup Location',
                'Return Location',
                'Pickup Date',
                'Return Date',
                'Pickup Time',
                'Return Time',
                'Name',
                'Email',
                'Phone',
                'Rental Type',
                'Car ID',
                'Status',
                'Price Accepted',
                'Price',
                'Receipt',
                'Additional Request',
                'Cancel Reason',
                'Cancel Fee',
                'Cancel Date',
                'Expenses'
            ];
    
            // Prepare data
            const data = filteredBookings.map(booking => [
                booking.booking_id,
                booking.user_id,
                booking.pickup_location || "",
                booking.return_location || "",
                formatDate(booking.pickup_date),
                formatDate(booking.return_date),
                booking.pickup_time || "",
                booking.return_time || "",
                booking.name,
                booking.email,
                booking.phone || "",
                booking.rental_type || "",
                booking.car_id,
                booking.status,
                booking.priceaccepted ? "Yes" : "No",
                booking.price || "",
                booking.receipt ? "Received" : "Not Received",
                booking.additionalrequest || "",
                booking.cancel_reason || "",
                booking.cancel_fee || "",
                formatDate(booking.cancel_date),
                booking.expenses || ""
            ]);
    
            // Combine headers and data
            const worksheetData = [headers, ...data];
    
            // Create a worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    
            // Get current timestamp for the filename
            const now = new Date();
            const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
            
            // Generate the Excel file
            XLSX.writeFile(workbook, `bookings_export_${timestamp}.xlsx`);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download bookings. Please try again.');
        }
    };
    const downloadAsCSV = () => {
        const headers = [
            'Booking ID', 'User ID', 'Pickup Location', 'Return Location', 
            'Pickup Date', 'Return Date', 'Pickup Time', 'Return Time', 
            'Name', 'Email', 'Phone', 'Rental Type', 'Car ID', 'Status', 
            'Price Accepted', 'Price', 'Receipt', 'Additional Request', 
            'Cancel Reason', 'Cancel Fee', 'Cancel Date', 'Expenses'
        ];
    
        const csvData = [
            headers,
            ...filteredBookings.map(booking => [
                booking.booking_id,
                booking.user_id,
                booking.pickup_location || "",
                booking.return_location || "",
                formatDate(booking.pickup_date),
                formatDate(booking.return_date),
                booking.pickup_time || "",
                booking.return_time || "",
                booking.name,
                booking.email,
                booking.phone || "",
                booking.rental_type || "",
                booking.car_id,
                booking.status,
                booking.priceaccepted ? "Yes" : "No",
                booking.price || "",
                booking.receipt ? "Received" : "Not Received",
                booking.additionalrequest || "",
                booking.cancel_reason || "",
                booking.cancel_fee || "",
                formatDate(booking.cancel_date),
                booking.expenses || ""
            ])
        ];
    
        const csvContent = csvData.map(e => e.map(String).map(v => v.includes(',') ? `"${v}"` : v).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
        // Get current timestamp for the filename
        const now = new Date();
        const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
        saveAs(blob, `bookings_export_${timestamp}.csv`);
    };

    const handleDownload = (type) => {
        setDownloadModalOpen(false);
        
        if (type === 'xlsx') {
            downloadAsExcel();
        } else if (type === 'csv') {
            downloadAsCSV();
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase().trim();
        setSearchTerm(term);
        
        const filtered = bookings.filter((booking) => {
            const bookingId = String(booking.booking_id).padStart(12, '0');
            const user_id = String(booking.user_id).padStart(12, '0');
            const name = booking.name.toLowerCase();
            const email = booking.email.toLowerCase();
            const status = booking.status.toLowerCase();
            
            return (
                bookingId.includes(term) ||
                user_id.includes(term) ||
                name.includes(term) ||
                email.includes(term) ||
                status.includes(term)
            );
        });
    
        setFilteredBookings(filtered);
        setCurrentPage(1);
    };
    const sortBookings = (key) => {
        let direction = 'ascending';
        
        // If clicking the same column, toggle direction
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        setSortConfig({ key, direction });

        const sortedBookings = [...filteredBookings].sort((a, b) => {
            // Handle null values
            if (a[key] === null) return 1;
            if (b[key] === null) return -1;
            
            // Special handling for dates
            if (key === 'created_at' || key === 'pickup_date' || key === 'return_date') {
                return direction === 'ascending'
                    ? new Date(a[key]) - new Date(b[key])
                    : new Date(b[key]) - new Date(a[key]);
            }

            // Special handling for boolean values
            if (typeof a[key] === 'boolean') {
                return direction === 'ascending'
                    ? (a[key] === b[key] ? 0 : a[key] ? -1 : 1)
                    : (a[key] === b[key] ? 0 : a[key] ? 1 : -1);
            }

            // Handle strings and numbers
            let compareA = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
            let compareB = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];

            if (compareA < compareB) return direction === 'ascending' ? -1 : 1;
            if (compareA > compareB) return direction === 'ascending' ? 1 : -1;
            return 0;
        });

        setFilteredBookings(sortedBookings);
    };

    const openDetailsModal = (booking) => {
        setSelectedBooking(booking);
        setDetailsModalOpen(true);
    };

    const openModifyModal = (booking) => {
        setSelectedBooking(booking);
        setModifyModalOpen(true);
    };

    const closeModals = () => {
        fetchBookings();
        setDetailsModalOpen(false);
        setModifyModalOpen(false);
        setSelectedBooking(null);
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        await fetchBookings();
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredBookings.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);
    const placeholderRows = Array(rowsPerPage - currentRows.length).fill(null);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Bookings List</h2>
                <div className='flex items-center'>
                    <button 
                        onClick={() => setDownloadModalOpen(true)}
                        className='ml-4 mr-2 bg-blue-500 text-white px-4 py-2 rounded-md flex items-center'
                    >
                        <Download className='mr-2' size={18} /> Download Table
                    </button>
                    
                    <div className='relative'>
                        <input
                            type='text'
                            placeholder='Search bookings...'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            onChange={handleSearch}
                            value={searchTerm}
                        />
                        <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                    </div>
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            {[
                                { key: 'booking_id', label: 'Booking ID' },
                                { key: 'user_id', label: 'User ID' },
                                { key: 'name', label: 'Name' },
                                { key: 'email', label: 'Email' },
                                { key: 'status', label: 'Status' },
                                { key: 'priceaccepted', label: 'Price Accepted' },
                                { key: 'created_at', label: 'Registration Date' }
                            ].map(({ key, label }) => (
                                <th 
                                    key={key}
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700'
                                    onClick={() => sortBookings(key)}
                                >
                                    <div className='flex items-center'>
                                        {label}
                                        <div className='ml-2 flex flex-col'>
                                            <ArrowUp 
                                                size={12} 
                                                className={`mb-0.5 ${
                                                    sortConfig.key === key && sortConfig.direction === 'ascending' 
                                                    ? 'text-blue-500' 
                                                    : 'text-gray-500'
                                                }`} 
                                            />
                                            <ArrowDown 
                                                size={12} 
                                                className={
                                                    sortConfig.key === key && sortConfig.direction === 'descending' 
                                                    ? 'text-blue-500' 
                                                    : 'text-gray-500'
                                                } 
                                            />
                                        </div>
                                    </div>
                                </th>
                            ))}
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentRows.map((booking) => (
                            <motion.tr
                                key={booking.booking_id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{booking.booking_id}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{booking.user_id}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{booking.name}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{booking.email}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{booking.status}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{booking.priceaccepted ? "Yes" : "No"}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{formatDate(booking.created_at)}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2' onClick={() => openDetailsModal(booking)}>
                                        <Eye size={18} />
                                    </button>
                                    <button className='text-green-400 hover:text-green-300 mr-2' onClick={() => openModifyModal(booking)}>
                                        <Edit size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                        {placeholderRows.map((_, index) => (
                            <tr key={`placeholder-${index}`} className='h-[53px]'>
                                <td colSpan={8}></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className='flex justify-between items-center mt-4'>
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    className='bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50'
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                    className='bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50'
                >
                    Next
                </button>
            </div>

            <DownloadTypeModal 
                isOpen={isDownloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                onDownload={handleDownload}
            />

            <BookingDetailsModal 
                booking={selectedBooking} 
                isOpen={isDetailsModalOpen} 
                onClose={closeModals} 
                onStatusUpdate={handleStatusUpdate} 
            />

            <BookingModifyModal 
                booking={selectedBooking} 
                isOpen={isModifyModalOpen} 
                onClose={closeModals}
                onStatusUpdate={handleStatusUpdate} 
            />
        </motion.div>
    );
};

export default BookingTable;