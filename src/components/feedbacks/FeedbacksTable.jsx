import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Star, Search, Download, ArrowUp, ArrowDown } from "lucide-react";
import DownloadTypeModal from "../common/DownloadTypeModal";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

const FeedbacksTable = () => {
    const rowsPerPage = 7;
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/feedback/feedback-table?role=${encodeURIComponent(role)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            console.log(data);
            setFeedbacks(data);
            setFilteredFeedbacks(data);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = feedbacks.filter((feedback) => 
            feedback.description.toLowerCase().includes(term) || 
            feedback.user_id.toLowerCase().includes(term)
        );
        setFilteredFeedbacks(filtered);
        setCurrentPage(1);
    };

    const indexOfLastFeedback = currentPage * rowsPerPage;
    const indexOfFirstFeedback = indexOfLastFeedback - rowsPerPage;
    const currentFeedbacks = filteredFeedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
    const totalPages = Math.ceil(filteredFeedbacks.length / rowsPerPage);

    const placeholderRowsCount = rowsPerPage - currentFeedbacks.length;
    const placeholderRows = Array(placeholderRowsCount).fill(null);

    const downloadCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + filteredFeedbacks.map(feedback => 
                `${feedback.user_id},${feedback.car_id},${feedback.booking_id},${new Date(feedback.created_at).toLocaleString([], { timeZone: 'UTC', hour12: false })},${feedback.rating},${feedback.description}` // Formatted date without timezone
            ).join("\n");
    
        const encodedUri = encodeURI(csvContent);
        
        const now = new Date();
        const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `feedbacks_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredFeedbacks.map(feedback => ({
            "User ID": feedback.user_id,
            "Car ID": feedback.car_id,
            "Booking ID": feedback.booking_id,
            "Created At": new Date(feedback.created_at).toLocaleString([], { timeZone: 'UTC', hour12: false }), // Formatted date without timezone
            "Rating": feedback.rating,
            "Description": feedback.description,
        })));
    
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Feedbacks");
    
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
        const now = new Date();
        const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
        saveAs(blob, `feedbacks_${timestamp}.xlsx`);
    };

    const handleDownload = (type) => {
        setDownloadModalOpen(false);
        if (type === 'xlsx') {
            downloadExcel();
        } else {
            downloadCSV();
        }
    };

    const sortFeedbacks = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
    
        const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
            const aValue = key === 'created_at' ? new Date(a[key]).toLocaleString([], { timeZone: 'UTC', hour12: false }) : a[key]; // Formatted date
            const bValue = key === 'created_at' ? new Date(b[key]).toLocaleString([], { timeZone: 'UTC', hour12: false }) : b[key];

            const isNumeric = (value) => !isNaN(value) && value !== null && value !== '';

            if (isNumeric(aValue) && isNumeric(bValue)) {
                return direction === 'ascending' ? aValue - bValue : bValue - aValue;
            } else {
                return direction === 'ascending' 
                    ? aValue.localeCompare(bValue) 
                    : bValue.localeCompare(aValue);
            }
        });
    
        setFilteredFeedbacks(sortedFeedbacks);
        setSortConfig({ key, direction });
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-400'}`} />
            );
        }
        return <div className="flex space-x-1">{stars}</div>;
    };

    const openModal = (description) => {
        setSelectedDescription(description);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDescription(null);
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Feedbacks</h2>
                <div className='flex items-center'>
                    <button 
                        onClick={() => setDownloadModalOpen(true)}
                        className='ml-4 bg-blue-500 text-white px-4 py-2 rounded-md flex items-center'
                    >
                        <Download className='mr-2' size={18} /> Download Table
                    </button>
                    <div className='relative ml-2'>
                        <input
                            type='text'
                            placeholder='Search feedbacks...'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                    </div>
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700' onClick={() => sortFeedbacks('car_id')}>
                                Car ID
                                <div className='ml-2 flex flex-col'>
                                    <ArrowUp size={12} className={`mb-0.5 ${sortConfig.key === 'car_id' && sortConfig.direction === 'ascending' ? 'text-blue-500' : 'text-gray-500'}`} />
                                    <ArrowDown size={12} className={sortConfig.key === 'car_id' && sortConfig.direction === 'descending' ? 'text-blue-500' : 'text-gray-500'} />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700' onClick={() => sortFeedbacks('rating')}>
                                Rating
                                <div className='ml-2 flex flex-col'>
                                    <ArrowUp size={12} className={`mb-0.5 ${sortConfig.key === 'rating' && sortConfig.direction === 'ascending' ? 'text-blue-500' : 'text-gray-500'}`} />
                                    <ArrowDown size={12} className={sortConfig.key === 'rating' && sortConfig.direction === 'descending' ? 'text-blue-500' : 'text-gray-500'} />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Description
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700' onClick={() => sortFeedbacks('booking_id')}>
                                Booking ID
                                <div className='ml-2 flex flex-col'>
                                    <ArrowUp size={12} className={`mb-0.5 ${sortConfig.key === 'booking_id' && sortConfig.direction === 'ascending' ? 'text-blue-500' : 'text-gray-500'}`} />
                                    <ArrowDown size={12} className={sortConfig.key === 'booking_id' && sortConfig.direction === 'descending' ? 'text-blue-500' : 'text-gray-500'} />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700' onClick={() => sortFeedbacks('user_id')}>
                                User ID
                                <div className='ml-2 flex flex-col'>
                                    <ArrowUp size={12} className={`mb-0.5 ${sortConfig.key === 'user_id' && sortConfig.direction === 'ascending' ? 'text-blue-500' : 'text-gray-500'}`} />
                                    <ArrowDown size={12} className={sortConfig.key === 'user_id' && sortConfig.direction === 'descending' ? 'text-blue-500' : 'text-gray-500'} />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700' onClick={() => sortFeedbacks('created_at')}>
                                Created At
                                <div className='ml-2 flex flex-col'>
                                    <ArrowUp size={12} className={`mb-0.5 ${sortConfig.key === 'created_at' && sortConfig.direction === 'ascending' ? 'text-blue-500' : 'text-gray-500'}`} />
                                    <ArrowDown size={12} className={sortConfig.key === 'created_at' && sortConfig.direction === 'descending' ? 'text-blue-500' : 'text-gray-500'} />
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentFeedbacks.map((feedback) => (
                            <motion.tr
                                key={feedback.f_id} // Use f_id as the unique key
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{feedback.car_id}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{renderStars(feedback.rating)}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <button
                                        onClick={() => openModal(feedback.description)}
                                        className='text-blue-500 hover:underline'
                                    >
                                        See Details
                                    </button>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{feedback.booking_id}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{feedback.user_id}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{new Date(feedback.created_at).toLocaleString([], { timeZone: 'UTC', hour12: true })}</div> {/* Formatted date without timezone */}
                                </td>
                            </motion.tr>
                        ))}
                        {placeholderRows.map((_, index) => (
                            <tr key={`placeholder-${index}`} className='h-[53px]'>
                                <td colSpan={7}></td>
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

            {/* Modal for Feedback Description */}
            {showModal && createPortal(
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-white mb-4">Feedback Description</h3>
                        <div className="border-2 border-gray-600 rounded-md p-4 mb-6">
                            <p className="text-gray-400">{selectedDescription}</p>
                        </div>
                        <div className="flex justify-center">
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Download Type Modal */}
            <DownloadTypeModal 
                isOpen={isDownloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                onDownload={handleDownload}
            />
        </motion.div>
    );
};

export default FeedbacksTable;