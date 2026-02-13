import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Download, ArrowUp, ArrowDown, ReceiptText, Send } from "lucide-react";
import DownloadTypeModal from "../common/DownloadTypeModal";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

const SalesTable = () => {
    const rowsPerPage = 8;
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [carInfo, setCarInfo] = useState({});  // New state for car information

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getUTCFullYear();
        
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const fetchSales = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/sales/sales-table?role=${encodeURIComponent(role)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setSales(data);
            setFilteredSales(data); // Initialize filtered sales
        } catch (error) {
        }
    };
    const carDetails = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/sales/car-details?role=${encodeURIComponent(role)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            // Transform the data into a more useful structure
            const carInfoMap = data.reduce((acc, car) => {
                acc[car.id] = {
                    id: car.id,
                    carId: `${car.type} - ${car.plate_num}`,
                    driver: car.driver,
                    brand: car.brand,
                    model: car.model,
                    capacity: car.capacity,
                    luggage: car.luggage,
                    doors: car.doors,
                    transmission: car.transmission,
                    features: car.features,
                    status: car.status,
                    price: car.price,
                    description: car.description
                };
                return acc;
            }, {});
            
            setCarInfo(carInfoMap);
        } catch (error) {
        }
    };

    useEffect(() => {
        carDetails();
        fetchSales();
    }, []);

    const renderCarInfo = (carId) => {
        const car = carInfo[carId];
        if (!car) return carId;
        return (
            <div className="text-sm">
                <div className="font-medium">{car.carId}</div>
                <div className="text-gray-400 text-xs">
                    {car.brand} {car.model} • {car.driver || 'No driver assigned'}
                </div>
            </div>
        );
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = sales.filter((sale) => 
            sale.booking_id.toLowerCase().includes(term) || 
            sale.car_id.toLowerCase().includes(term) ||
            sale.officer.toLowerCase().includes(term)
        );
        setFilteredSales(filtered);
        setCurrentPage(1); // Reset to the first page on search
    };

    const indexOfLastSale = currentPage * rowsPerPage;
    const indexOfFirstSale = indexOfLastSale - rowsPerPage;
    const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
    const totalPages = Math.ceil(filteredSales.length / rowsPerPage);

    const placeholderRowsCount = rowsPerPage - currentSales.length;
    const placeholderRows = Array(placeholderRowsCount).fill(null);

    const openModal = (sale) => {
        setSelectedSale(sale);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSale(null);
    };

    const downloadCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + filteredSales.map(sale => 
                `${sale.booking_id},${sale.car_id},${sale.status},${sale.status === 'Cancelled' ? 'N/A' : sale.price},${(sale.status === 'Cancelled' ? 'N/A' : sale.expenses)},${(sale.status === 'Finished' ? 'N/A' : sale.cancel_fee)},${sale.officer},${formatDate(sale.created_at)}`
            ).join("\n");
    
        const encodedUri = encodeURI(csvContent);
        
        const now = new Date();
        const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredSales.map(sale => ({
            "Booking ID": sale.booking_id,
            "Car ID": sale.car_id,
            "Status": sale.status,
            "Price": sale.status === 'Cancelled' ? sale.price : sale.price,
            "Expenses": sale.status === 'Cancelled' ? 'N/A' : sale.expenses,
            "Cancel Fee": sale.status === 'Finished' ? 'N/A' : sale.cancel_fee,
            "Officer": sale.officer,
            "Created At": formatDate(sale.created_at), // Using formatDate here
        })));
    
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
        const now = new Date();
        const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
        saveAs(blob, `sales_${timestamp}.xlsx`);
    };

    const handleDownload = (type) => {
        setDownloadModalOpen(false);
        if (type === 'xlsx') {
            downloadExcel();
        } else {
            downloadCSV();
        }
    };

    const sortSales = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        const sortedSales = [...filteredSales].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });

        setFilteredSales(sortedSales);
        setSortConfig({ key, direction });
    };

    const handleGenerateInvoice = async (sale) => {
        if (!sale) return;
        const car = carInfo[sale.car_id];
    if (!car) {
        return;
    }
        // Extract necessary data from the sale object
        const invoiceData = {
            bookingId: sale.booking_id,
            carId: car.carId, // Use the existing carId property
            officer: sale.officer,
            createdAt: sale.created_at,
            pickupDate: sale.pickup_date,
            returnDate: sale.return_date,
            rentalType: sale.rental_type,
            name: sale.name,
            price: sale.price,
            driver: car.driver || 'No driver assigned' // Including driver information
        };
    
        try {
            const response = await fetch(`${apiUrl}/api/generate-invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invoiceData),
            });
    
            if (!response.ok) {
                const errorMessage = await response.text(); // Log the response text for more info
                throw new Error(`Failed to generate invoice: ${errorMessage}`);
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${sale.booking_id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
        }
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Sales</h2>
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
                            placeholder='Search sales...'
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
                            {[
                                { key: 'booking_id', label: 'Booking ID' },
                                { key: 'car_id', label: 'Car ID' },
                                { key: 'status', label: 'Status' },
                                { key: 'price', label: 'Price' },
                                { key: 'expenses', label: 'Expenses' },
                                { key: 'cancel_fee', label: 'Cancel Fee' },
                                { key: 'officer', label: 'Officer' },
                                { key: 'created_at', label: 'Created At' },
                            ].map(({ key, label }) => (
                                <th 
                                    key={key}
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700'
                                    onClick={() => sortSales(key)}
                                >
                                    <div className='flex items-center'>
                                        {label}
                                        <div className='ml-2 flex flex-col'>
                                            <ArrowUp 
                                                size={12} 
                                                className={`mb-0.5 ${sortConfig.key === key && sortConfig.direction === 'ascending' ? 'text-blue-500' : 'text-gray-500'}`} 
                                            />
                                            <ArrowDown 
                                                size={12} 
                                                className={sortConfig.key === key && sortConfig.direction === 'descending' ? 'text-blue-500' : 'text-gray-500'} 
                                            />
                                        </div>
                                    </div>
                                </th>
                            ))}
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentSales.map((sale) => (
                            <motion.tr
                                key={sale.booking_id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{sale.booking_id}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm font-medium text-gray-100'>{sale.car_id}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{sale.status}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className={`text-sm ${sale.status === 'Cancelled' ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                        {sale.status === 'Cancelled' ? sale.price : sale.price}
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{sale.status === 'Cancelled' ? 'N/A' : sale.expenses}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{sale.status === 'Finished' ? 'N/A' : sale.cancel_fee}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{sale.officer}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{formatDate(sale.created_at)}</div> {/* Using formatDate here */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
    <button 
        onClick={() => handleGenerateInvoice(sale)} // Pass the sale here
        className={`mr-2 ${sale.status === 'Finished' ? 'text-purple-400 hover:text-purple-300' : 'text-red-500 opacity-50 cursor-not-allowed'}`}
        disabled={sale.status !== 'Finished'} // Disable if status is not Finished
    >
        <ReceiptText size={18} />
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

            {/* User Info Modal */}
            {showModal && (
                <UserDetailsModal user={selectedSale} onClose={closeModal} />
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

export default SalesTable;
