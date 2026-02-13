import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Trash } from "lucide-react"; // Import the Trash icon
import AddUserModal from './AddUserModal'; // Import the AddUserModal

const apiUrl = import.meta.env.VITE_API_URL;

const AdminsTable = () => {
    const rowsPerPage = 8;
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    const fetchAdmins = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/admins`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setAdmins(data);
            setFilteredAdmins(data);
        } catch (error) {
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = admins.filter((admin) => 
            admin.name.toLowerCase().includes(term) || 
            admin.email.toLowerCase().includes(term)
        );
        setFilteredAdmins(filtered);
        setCurrentPage(1);
    };

    const indexOfLastAdmin = currentPage * rowsPerPage;
    const indexOfFirstAdmin = indexOfLastAdmin - rowsPerPage;
    const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
    const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage);

    const handleAddUser = async (newUser) => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/admins?role=${newUser.role}`, { // Use newUser.role
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });
    
            if (response.ok) {
                const addedUser = await response.json();
                setAdmins((prev) => [...prev, addedUser]);
                setFilteredAdmins((prev) => [...prev, addedUser]);
            } else {
            }
        } catch (error) {
        }
    };

    const handleDeleteUser = async (id) => {
        // Logic to delete the user
        try {
            const response = await fetch(`${apiUrl}/api/admin/admins/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAdmins((prev) => prev.filter((admin) => admin.id !== id));
                setFilteredAdmins((prev) => prev.filter((admin) => admin.id !== id));
            } else {
            }
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
                <h2 className='text-xl font-semibold text-gray-100'>Admins</h2>
                <div className='flex items-center'>
                    <button 
                        onClick={() => setIsAddUserModalOpen(true)}
                        className='ml-4 bg-green-500 text-white px-4 py-2 rounded-md flex items-center'
                    >
                        Add User
                    </button>
                    <div className='relative ml-2'>
                        <input
                            type='text'
                            placeholder='Search admins...'
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
                                { key: 'id', label: 'Admin ID' },
                                { key: 'name', label: 'Name' },
                                { key: 'email', label: 'Email' },
                                { key: 'role', label: 'Role' },
                                { key: 'created_at', label: 'Created At' },
                                { key: 'actions', label: 'Actions' },
                            ].map(({ key, label }) => (
                                <th 
                                    key={key}
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentAdmins.map((admin) => (
                            <motion.tr
                                key={admin.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{admin.id}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm font-medium text-gray-100'>{admin.name}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{admin.email}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{admin.role}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{formatDate(admin.created_at)}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button 
                                        className='text-red-500 hover:text-red-400'
                                        onClick={() => handleDeleteUser(admin.id)}
                                    >
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </motion.tr>
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

            <AddUserModal 
                isOpen={isAddUserModalOpen} 
                onClose={() => setIsAddUserModalOpen(false)} 
                onAddUser={handleAddUser} 
            />
        </motion.div>
    );
};

export default AdminsTable;
