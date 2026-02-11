import React, { useState, useMemo } from "react";

const SecurityLog = ({ logs, isOpen, onClose, isLoading, error }) => {
    const [selectedLog, setSelectedLog] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 7;

    if (!isOpen) return null;

    // Filter logs based on search term
    const filteredLogs = useMemo(() => {
        if (!searchTerm.trim()) return logs;
        
        const searchLower = searchTerm.toLowerCase();
        return logs.filter(log => 
            log.id.toString().includes(searchLower) ||
            log.admin_name.toLowerCase().includes(searchLower) ||
            log.admin_id.toString().includes(searchLower) ||
            log.action.toLowerCase().includes(searchLower) ||
            log.admin_role.toLowerCase().includes(searchLower) ||
            new Date(log.timestamp).toLocaleString().toLowerCase().includes(searchLower)
        );
    }, [logs, searchTerm]);

    // Reset to first page when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[100]">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 h-[80vh]">
                    <div className="flex flex-col h-full justify-center items-center">
                        <p className="text-gray-400 text-xl">Loading logs...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[100]">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 h-[80vh]">
                    <div className="flex flex-col h-full justify-center items-center">
                        <p className="text-red-500 text-xl mb-4">{error}</p>
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleViewDetails = (log) => {
        setSelectedLog(log);
    };

    const closeDetailsModal = () => {
        setSelectedLog(null);
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, endIndex);

    if (logs.length === 0) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[100]">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 h-[80vh]">
                    <div className="flex flex-col h-full justify-center items-center">
                        <p className="text-gray-400 text-xl">No logs available</p>
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-4"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[100]">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 h-[82vh] flex flex-col">
                <h2 className="text-xl font-bold text-gray-100 mb-4">Detailed Security Logs</h2>

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                            >
                                <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {filteredLogs.length === 0 && (
                        <p className="text-gray-400 mt-2">No results found for "{searchTerm}"</p>
                    )}
                </div>

                <div className="flex-1 overflow-auto min-h-0">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="sticky top-0 bg-gray-800 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {currentLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{log.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{log.admin_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{log.admin_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{log.action}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{log.admin_role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                            onClick={() => handleViewDetails(log)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
                    <div className="flex items-center">
                        <p className="text-sm text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>

            {selectedLog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[200]">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 text-center">
                        <h3 className="text-lg font-bold text-gray-100 mb-4">Log Details</h3>
                        <pre className="text-gray-300 text-left whitespace-pre-wrap">
                            {JSON.stringify(selectedLog.details, null, 2)}
                        </pre>
                        <button
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-4"
                            onClick={closeDetailsModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityLog;