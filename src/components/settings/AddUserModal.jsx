import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash } from 'lucide-react';

const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Developer'); // Default role

    const handleSubmit = (e) => {
        e.preventDefault();
        const newUser = { name, email, role };
        onAddUser(newUser);
        onClose(); // Close the modal after adding the user
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 relative w-11/12 md:w-1/2">
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
                >
                    &times;
                </button>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Add New Admin</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full p-2 bg-gray-700 text-white rounded" 
                            required 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full p-2 bg-gray-700 text-white rounded" 
                            required 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Role</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)} 
                            className="w-full p-2 bg-gray-700 text-white rounded"
                        >
                            <option value="Developer">Developer</option>
                            <option value="Trial">Trial</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        Add Admin
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddUserModal;