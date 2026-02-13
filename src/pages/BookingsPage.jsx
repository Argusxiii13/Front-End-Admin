import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";

import { AlertTriangle, BookCopy, CheckCheck, Flag } from "lucide-react";
import BookingTable from "../components/bookings/BookingTable";
import BookingsPieChart from "../components/bookings/BookingPieChart";
import BookingLineGraph from "../components/bookings/BookingLineGraph";
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
const apiUrl = import.meta.env.VITE_API_URL;

const BookingsPage = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalCancelledBookings: 0,
        totalFinishedBookings: 0,
        totalPendingBookings: 0,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {   
                const response = await fetch(`${apiUrl}/api/admin/booking/statistics?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setStats(data);
            } catch (error) {
                setError(error.message || 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    if (isLoading) {
        return (
            <div className='flex-1 overflow-auto relative z-10'>
                <Header title='Bookings' />
                <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
                        {[1, 2, 3, 4].map((item) => (
                            <StatCard
                                key={item}
                                name='Loading...'
                                icon={BookCopy}
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
                <Header title='Bookings Management' />
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
            <Header title='Bookings Management' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Bookings' icon={BookCopy} value={stats.totalBookings} color='#6366F1' />
                    <StatCard name='Total Pending Bookings' icon={Flag} value={stats.totalPendingBookings} color='#F59E0B' />
                    <StatCard name='Total Cancelled Bookings' icon={AlertTriangle} value={stats.totalCancelledBookings} color='#EF4444' />
                    <StatCard name='Total Finished Bookings' icon={CheckCheck} value={stats.totalFinishedBookings} color='#10B981' />
                    
                </motion.div>

                <BookingTable />

                <div className='grid grid-col-1 lg:grid-cols-2 gap-8'>
                    <BookingsPieChart />
                    <BookingLineGraph />
                </div>
            </main>
        </div>
    );
};

export default BookingsPage;
