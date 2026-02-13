import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Download, Trash } from "lucide-react";
import VehicleDetailsModal from "./VehicleDetailsModal"; 
import VehicleAddModal from "./VehicleAddModal"; 
import DownloadTypeModal from "../common/DownloadTypeModal";
import ConfirmationModal from "../common/ConfirmationModal"; // Ensure this is the updated modal
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ReactDOM from 'react-dom'; // Import ReactDOM for portal

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

const FleetTable = () => {
    const rowsPerPage = 8; 
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [carToDelete, setCarToDelete] = useState(null);

    const fetchCars = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/fleet/fleet-table?role=${encodeURIComponent(role)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setCars(data);
            setFilteredCars(data);
        } catch (error) {
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = cars.filter(
            (car) => car.id.toLowerCase().includes(term) || car.brand.toLowerCase().includes(term)
        );
        setFilteredCars(filtered);
        setCurrentPage(1);
    };

    const handleAddButtonClick = () => {
        setIsAddModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
    };

    const handleAddModalClose = () => {
        setIsAddModalOpen(false);
        fetchCars(); 
    };

    const handleDownload = async (type) => {
        setDownloadModalOpen(false);
        if (type === 'xlsx') {
            await downloadAsExcel();
        } else if (type === 'csv') {
            downloadAsCSV();
        }
    };

    const downloadAsExcel = async () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredCars);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cars');
    
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
    
        const now = new Date();
        const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
        saveAs(blob, `fleet_export_${timestamp}.xlsx`);
    };

    const downloadAsCSV = () => {
        const headers = ['ID', 'Plate Number', 'Brand', 'Model', 'Type'];
        const csvData = [headers, ...filteredCars.map(car => [car.id, car.plate_num, car.brand, car.model, car.type])];
        const csvContent = csvData.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
        const now = new Date();
        const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
        saveAs(blob, `fleet_export_${timestamp}.csv`);
    };

    const indexOfLastCar = currentPage * rowsPerPage;
    const indexOfFirstCar = indexOfLastCar - rowsPerPage;
    const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
    const totalPages = Math.ceil(filteredCars.length / rowsPerPage);

    const handleEyeClick = (car) => {
        setSelectedVehicle(car);
        setIsModalOpen(true);
    };

    const placeholderRowsCount = rowsPerPage - currentCars.length;
    const placeholderRows = Array(placeholderRowsCount).fill(null);

    const handleDeleteClick = (carId) => {
        setCarToDelete(carId);
        setIsConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (carToDelete) {
            try {
                const response = await fetch(`${apiUrl}/api/admin/fleet/fleet-table/${carToDelete}?role=${encodeURIComponent(role)}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchCars();
                } else {
                }
            } catch (error) {
            }
            setCarToDelete(null);
        }
        setIsConfirmDeleteOpen(false);
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Fleet List</h2>
                <div className='relative flex items-center'>
                    <button
                        onClick={handleAddButtonClick} 
                        className='ml-2 bg-blue-500 text-white px-4 py-2 rounded-md'
                    >
                        Add Vehicle
                    </button>
                    <button 
                        onClick={() => setDownloadModalOpen(true)}
                        className='ml-4 bg-blue-500 text-white px-4 py-2 rounded-md flex items-center'
                    >
                        <Download className='mr-2' size={18} /> Download Table
                    </button>
                    <div className='relative ml-3'>
                        <input
                            type='text'
                            placeholder='Search vehicles...'
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>ID</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Plate Number</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Brand</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Model</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Type</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentCars.map((car) => (
                            <motion.tr
                                key={car.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{car.id}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{car.plate_num}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{car.brand}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{car.model}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{car.type}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button
                                        className='text-indigo-400 hover:text-indigo-300 mr-2'
                                        onClick={() => handleEyeClick(car)}
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        className='text-red-400 hover:text-red-300'
                                        onClick={() => handleDeleteClick(car.id)}
                                    >
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                        {placeholderRows.map((_, index) => (
                            <tr key={`placeholder-${index}`} className='h-[53px]'>
                                <td colSpan={6}></td>
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

            {/* Download Type Modal */}
            <DownloadTypeModal 
                isOpen={isDownloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                onDownload={handleDownload}
            />

            {/* Vehicle Details Modal */}
            {isModalOpen && (
                <VehicleDetailsModal 
                    vehicle={selectedVehicle} 
                    onClose={handleModalClose} 
                    refresh={fetchCars}
                />
            )}

            {/* Vehicle Add Modal */}
            {isAddModalOpen && (
                <VehicleAddModal 
                    onClose={handleAddModalClose} 
                    onAddSuccess={fetchCars} 
                />
            )}

            {/* Confirmation Modal as a portal */}
            {isConfirmDeleteOpen && ReactDOM.createPortal(
                <ConfirmationModal 
                    isOpen={isConfirmDeleteOpen}
                    onConfirm={confirmDelete}
                    onCancel={() => setIsConfirmDeleteOpen(false)}
                    message="Are you sure you want to delete this vehicle?"
                />,
                document.body // Render to body for portal effect
            )}
        </motion.div>
    );
};

export default FleetTable;
