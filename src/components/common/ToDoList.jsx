import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
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

const ToDoList = () => {
    const rowsPerPage = 5;
    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/dashboard/task?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTasks(data.map(task => ({ ...task, isConfirming: false })));
            } catch (error) {
            }
        };

        fetchTasks();
    }, []);

    const handleAddTask = async () => {
        if (inputValue.trim()) {
            const newTask = { task: inputValue.trim(), date: new Date().toLocaleDateString('en-CA') };
    
            try {
                const response = await fetch(`${apiUrl}/api/admin/dashboard/task?role=${encodeURIComponent(role)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newTask),
                });
    
                if (!response.ok) {
                    throw new Error('Failed to add task');
                }
    
                const addedTask = await response.json();
                setTasks(prevTasks => [...prevTasks, { ...addedTask, isConfirming: false }]);
                setInputValue('');
                setIsInputOpen(false);
                setCurrentPage(Math.ceil((tasks.length + 1) / rowsPerPage));
            } catch (error) {
            }
        }
    };

    const handleToggleConfirm = (taskId) => {
        setTasks(prevTasks => 
            prevTasks.map(task => {
                if (task.id === taskId) {
                    // Clear existing timeout if any
                    if (task.timeoutId) {
                        clearTimeout(task.timeoutId);
                    }
                    
                    // Set new timeout only if we're enabling confirmation
                    const timeoutId = !task.isConfirming ? 
                        setTimeout(() => {
                            setTasks(prev => 
                                prev.map(t => 
                                    t.id === taskId ? { ...t, isConfirming: false } : t
                                )
                            );
                        }, 3000) : null;

                    return {
                        ...task,
                        isConfirming: !task.isConfirming,
                        timeoutId
                    };
                }
                return task;
            })
        );
    };

    const handleRemoveTask = async (taskId) => {
    
        try {
            const response = await fetch(`${apiUrl}/api/admin/dashboard/task/${taskId}?role=${encodeURIComponent(role)}`, {
                method: 'DELETE',
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
    
            // Remove the task from state immediately after successful deletion
            setTasks(prevTasks => {
                const newTasks = prevTasks.filter(task => task.id !== taskId);
                
                // Adjust current page if necessary
                const totalPages = Math.ceil(newTasks.length / rowsPerPage);
                if (currentPage > totalPages) {
                    setCurrentPage(Math.max(1, totalPages));
                }
                
                return newTasks;
            });
        } catch (error) {
        }
    };

    const indexOfLastTask = currentPage * rowsPerPage;
    const indexOfFirstTask = indexOfLastTask - rowsPerPage;
    const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(tasks.length / rowsPerPage);
    const placeholderRowsCount = rowsPerPage - currentTasks.length;
    const placeholderRows = Array(placeholderRowsCount).fill(null);

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-CA', options);
    };

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-7">
                <h2 className="text-lg font-medium text-gray-100">To-Do List</h2>
                <motion.button
                    className={`flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 ${isInputOpen ? 'mr-2' : ''}`}
                    onClick={() => setIsInputOpen(!isInputOpen)}
                >
                    {isInputOpen ? <X size={20} /> : <Plus size={20} />}
                </motion.button>
            </div>

            {isInputOpen && (
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 'auto' }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center mb-4"
                >
                    <input
                        type="text"
                        className="w-full h-10 px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-gray-200 mr-2"
                        placeholder="Add a new task..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600"
                        onClick={handleAddTask}
                    >
                        Add
                    </button>
                </motion.div>
            )}

            <div className="space-y-2">
                {currentTasks.map((task) => (
                    <div key={task.id} className="flex justify-between items-center p-2 bg-gray-700 rounded-md">
                        <span className="text-gray-100">{task.task}</span>
                        <div className="flex items-center">
                            <span className="text-gray-400 text-sm mr-4">{formatDate(task.date)}</span>
                            <button
                                className={`text-${task.isConfirming ? 'green' : 'red'}-500 hover:text-${task.isConfirming ? 'green' : 'red'}-700`}
                                style={{ width: '100px' }}
                                onClick={() => {
                                    if (task.isConfirming) {
                                        handleRemoveTask(task.id);
                                    } else {
                                        handleToggleConfirm(task.id);
                                    }
                                }}
                            >
                                {task.isConfirming ? 'Confirmed?' : 'Remove'}
                            </button>
                        </div>
                    </div>
                ))}
                {placeholderRows.map((_, index) => (
                    <div key={`placeholder-${index}`} className="flex justify-between items-center p-2 bg-gray-600 rounded-md opacity-50">
                        <span className="text-gray-400">Add More...</span>
                        <span className="text-gray-400">Remove</span>
                    </div>
                ))}
            </div>

            {!isInputOpen && (
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
            )}
        </motion.div>
    );
};

export default ToDoList;
