import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Download, ArrowUp, ArrowDown } from "lucide-react";
import UserDetailsModal from './UserDetailsModal';
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

const UsersTable = () => {
    const rowsPerPage = 8;
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/users/users-table?role=${encodeURIComponent(role)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = users.filter((user) => 
            user.name.toLowerCase().includes(term) || 
            user.email.toLowerCase().includes(term)
        );
        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const indexOfLastUser = currentPage * rowsPerPage;
    const indexOfFirstUser = indexOfLastUser - rowsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

    const placeholderRowsCount = rowsPerPage - currentUsers.length;
    const placeholderRows = Array(placeholderRowsCount).fill(null);

    const openModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const downloadCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + filteredUsers.map(user => 
                `${user.id},${user.name},${user.email},${user.phonenumber},${user.gender},${formatDate(user.created_at)}`
            ).join("\n");
    
        const encodedUri = encodeURI(csvContent);
        const now = new Date();
        const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
            "User ID": user.id,
            "Name": user.name,
            "Email": user.email,
            "Phone Number": user.phonenumber,
            "Gender": user.gender,
            "Created At": formatDate(user.created_at), // Using formatDate here
        })));
    
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
        const now = new Date();
        const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
        saveAs(blob, `users_${timestamp}.xlsx`);
    };

    const handleDownload = (type) => {
        setDownloadModalOpen(false);
        if (type === 'xlsx') {
            downloadExcel();
        } else {
            downloadCSV();
        }
    };

    const sortUsers = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        const sortedUsers = [...filteredUsers].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });

        setFilteredUsers(sortedUsers);
        setSortConfig({ key, direction });
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Users</h2>
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
                            placeholder='Search users...'
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
                                { key: 'id', label: 'User ID' },
                                { key: 'name', label: 'Name' },
                                { key: 'email', label: 'Email' },
                                { key: 'phonenumber', label: 'Phone Number' },
                                { key: 'gender', label: 'Gender' },
                                { key: 'created_at', label: 'Created At' },
                            ].map(({ key, label }) => (
                                <th 
                                    key={key}
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700'
                                    onClick={() => sortUsers(key)}
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
                        {currentUsers.map((user) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{user.id}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm font-medium text-gray-100'>{user.name}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{user.email}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{user.phonenumber}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{user.gender}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{formatDate(user.created_at)}</div> {/* Using formatDate here */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2' onClick={() => openModal(user)}>
                                        <Eye size={18} />
                                    </button>
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

            {/* User Info Modal */}
            {showModal && (
                <UserDetailsModal user={selectedUser} onClose={closeModal} />
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

export default UsersTable;