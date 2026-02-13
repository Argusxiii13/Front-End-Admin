import React, { useEffect, useState } from 'react';
import { Handshake, MessageCircle, Users, BookOpenCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import BookingsOverviewToday from '../components/dashboard/BookingsOverviewToday';
import OngoingBookings from '../components/dashboard/OngoingBookings';
import EarningsMadeToday from '../components/dashboard/EarningsMadeToday';
import ToDoList from '../components/common/ToDoList'; // Import ToDoList
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

const apiUrl = import.meta.env.VITE_API_URL;

const DashboardPage = () => {
    const [totalBookings, setTotalBookings] = useState('0');
    const [totalUsers, setTotalUsers] = useState('0');
    const [newFeedbackCount, setNewFeedbackCount] = useState('0');
    const [todayRevenue, setTodayRevenue] = useState('0.00');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTotalBookings = async (role) => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/dashboard/new-bookings?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTotalBookings(`${data.total}`);
            } catch (error) {
                setError('Failed to load total bookings.');
            }
        };

        const fetchTotalUsers = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/dashboard/new-users?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTotalUsers(`${data.total}`);
            } catch (error) {
                setError('Failed to load total users.');
            }
        };

        const fetchNewFeedbackCount = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/dashboard/new-feedback-count?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setNewFeedbackCount(`${data.total}`);
            } catch (error) {
                setError('Failed to load new feedback count.');
            }
        };

        const fetchTodayRevenue = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/dashboard/today-revenue?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTodayRevenue(`${data.total}`); // Ensure it's treated as a string
            } catch (error) {
                setError('Failed to load today\'s revenue.');
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
                fetchTotalBookings(),
                fetchTotalUsers(),
                fetchNewFeedbackCount(),
                fetchTodayRevenue(),
            ]);
            setLoading(false);
        };

        fetchData();
    }, []);

    const getStatCardColor = (value) => {
        return value === '0' || value === '0.00' ? '#EF4444' : '#10B981'; // Red if 0 or 0.00, green otherwise
    };

    if (loading) {
        return (
            <div className='flex-1 overflow-auto relative z-10'>
                <Header title='Loading' />
                <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
                        {[1, 2, 3, 4].map((item) => (
                            <StatCard 
                                key={item} 
                                name='Loading...' 
                                icon={BookOpenCheck} 
                                value='...' 
                                color='#D1D5DB' 
                                loading={true} 
                            />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex-1 overflow-auto relative z-10'>
                <Header title='Error' />
                <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' role='alert'>
                        <strong className='font-bold'>Error: </strong>
                        <span className='block sm:inline'>{error}</span>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Dashboard' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard 
                        name='New Bookings Today' 
                        icon={BookOpenCheck} 
                        value={totalBookings} 
                        color={getStatCardColor(totalBookings)} 
                    />
                    <StatCard 
                        name='New Users Today' 
                        icon={Users} 
                        value={totalUsers} 
                        color={getStatCardColor(totalUsers)} 
                    />
                    <StatCard 
                        name='New Feedback Today' 
                        icon={MessageCircle} 
                        value={newFeedbackCount} 
                        color={getStatCardColor(newFeedbackCount)} 
                    />
                    <StatCard 
                        name='Revenue Made Today' 
                        icon={Handshake} 
                        value={`₱${todayRevenue}`} 
                        color={getStatCardColor(todayRevenue)} 
                    />
                </motion.div>

                {/* CHARTS */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    <OngoingBookings /> 
                    <BookingsOverviewToday />
                    <EarningsMadeToday />
                    
                    {/* Integrate the ToDoList */}
                    <ToDoList />
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
