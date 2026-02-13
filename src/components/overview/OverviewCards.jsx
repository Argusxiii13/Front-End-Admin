import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { DollarSign, Handshake, BookOpen, Users } from "lucide-react";
import axios from 'axios';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

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
const OverviewCards = () => {
  const [overviewData, setOverviewData] = useState([
    { name: "Revenue", value: "₱0", change: 0, icon: Handshake },
    { name: "Net Income", value: "₱0", change: 0, icon: DollarSign },
    { name: "Bookings", value: "0", change: 0, icon: BookOpen },
    { name: "Registered Users", value: "0", change: 0, icon: Users }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const bookingsResponse = await axios.get(`${apiUrl}/api/admin/analytics/bookings-data?role=${encodeURIComponent(role)}`);
        const usersResponse = await axios.get(`${apiUrl}/api/admin/analytics/users-data?role=${encodeURIComponent(role)}`);

        const bookings = Array.isArray(bookingsResponse.data) 
          ? bookingsResponse.data 
          : bookingsResponse.data.bookings || bookingsResponse.data.data || [];

        const users = Array.isArray(usersResponse.data) 
          ? usersResponse.data 
          : usersResponse.data.users || usersResponse.data.data || [];

        const currentMonthStart = startOfMonth(new Date());
        const currentMonthEnd = endOfMonth(new Date());
        const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
        const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

        const currentMonthBookings = bookings.filter(booking => {
          if (!booking.created_at) {
            return false;
          }
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= currentMonthStart && bookingDate <= currentMonthEnd;
        });

        const lastMonthBookings = bookings.filter(booking => {
          if (!booking.created_at) {
            return false;
          }
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd;
        });

        const currentMonthUsers = users.filter(user => {
          if (!user.created_at) {
            return false;
          }
          const userDate = new Date(user.created_at);
          return userDate >= currentMonthStart && userDate <= currentMonthEnd;
        });

        const lastMonthUsers = users.filter(user => {
          if (!user.created_at) {
            return false;
          }
          const userDate = new Date(user.created_at);
          return userDate >= lastMonthStart && userDate <= lastMonthEnd;
        });

        const calculateRevenue = (bookingsToCalculate) => {
          const finishedConfirmedRevenue = bookingsToCalculate
            .filter(b => ['Finished', 'Confirmed'].includes(b.status))
            .reduce((sum, booking) => sum + (booking.price || 0), 0);

          const cancelledRevenue = bookingsToCalculate
            .filter(b => b.status === 'Cancelled')
            .reduce((sum, booking) => sum + (booking.cancel_fee || 0), 0);

          return finishedConfirmedRevenue + cancelledRevenue;
        };

        const currentMonthRevenue = calculateRevenue(currentMonthBookings);
        const lastMonthRevenue = calculateRevenue(lastMonthBookings);

        const calculateNetIncome = (bookingsToCalculate) => {
          const confirmedFinishedBookings = bookingsToCalculate
            .filter(b => ['Confirmed', 'Finished'].includes(b.status));
          
          const totalRevenue = confirmedFinishedBookings
            .reduce((sum, booking) => sum + (booking.price || 0), 0);
          
          const totalCancelledRevenue = bookingsToCalculate
            .filter(b => b.status === 'Cancelled')
            .reduce((sum, booking) => sum + (booking.cancel_fee || 0), 0);
          
          const totalExpenses = confirmedFinishedBookings
            .reduce((sum, booking) => sum + (booking.expenses || 0), 0);
          
          return totalRevenue + totalCancelledRevenue - totalExpenses;
        };

        const currentMonthNetIncome = calculateNetIncome(currentMonthBookings);
        const lastMonthNetIncome = calculateNetIncome(lastMonthBookings);

        const currentMonthBookingsCount = currentMonthBookings.length;
        const lastMonthBookingsCount = lastMonthBookings.length;

        const currentMonthUsersCount = currentMonthUsers.length;
        const lastMonthUsersCount = lastMonthUsers.length;

        const calculatePercentageChange = (current, previous) => {
          if (current === 0 && previous === 0) return 0; // Both are zero
          if (previous === 0) return current > 0 ? 100 : -100; 
          if (previous < 0) return (current - previous) / Math.abs(previous) * 100; 
          return ((current - previous) / previous) * 100;
        };

        const formattedOverviewData = [
          {
            name: "Revenue",
            value: `₱${currentMonthRevenue.toLocaleString()}`,
            change: calculatePercentageChange(currentMonthRevenue, lastMonthRevenue),
            icon: Handshake
          },
          {
            name: "Net Income",
            value: `₱${currentMonthNetIncome.toLocaleString()}`,
            change: calculatePercentageChange(currentMonthNetIncome, lastMonthNetIncome),
            icon: DollarSign
          },
          {
            name: "Bookings",
            value: currentMonthBookingsCount.toLocaleString(),
            change: calculatePercentageChange(currentMonthBookingsCount, lastMonthBookingsCount),
            icon: BookOpen
          },
          {
            name: "Registered Users",
            value: currentMonthUsersCount.toLocaleString(),
            change: calculatePercentageChange(currentMonthUsersCount, lastMonthUsersCount),
            icon: Users
          }
        ];

        setOverviewData(formattedOverviewData);
      } catch (error) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
        {[1, 2, 3, 4].map((item) => (
          <motion.div 
            key={item} 
            className='bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className='text-sm font-medium text-gray-400'>Loading...</h3>
            <p className='mt-1 text-xl font-semibold text-gray-100'>...</p>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
      {overviewData.map((item, index) => (
        <motion.div
          key={item.name}
          className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-gray-400'>{item.name}</h3>
              <p className='mt-1 text-xl font-semibold text-gray-100'>{item.value}</p>
            </div>

            <div
              className={`
                p-3 rounded-full bg-opacity-20 ${item.name === "Net Income" && item.value.startsWith('-') ? "bg-red-500" : item.change > 0 ? "bg-green-500" : "bg-red-500"}
              `}
            >
              <item.icon className={`size-6 ${item.name === "Net Income" && item.value.startsWith('-') ? "text-red-500" : item.change > 0 ? "text-green-500" : "text-red-500"}`} />
            </div>
          </div>
          <div
            className={`
              mt-4 flex items-center ${item.change > 0 ? "text-green-500" : item.change < 0 ? "text-red-500" : "text-gray-500"}
            `}
          >
            {item.change > 0 ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg> :
            item.change < 0 ?
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down-right">
                <line x1="7" y1="7" x2="17" y2="17"></line>
                <polyline points="17 7 17 17 7 17"></polyline>
              </svg> :
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                <line x1="7" y1="12" x2="17" y2="12"></line>
              </svg>
            }
            <span className='ml-1 text-sm font-medium'>{Math.abs(item.change).toFixed(1)}%</span>
            <span className='ml-2 text-sm text-gray-400'>vs last month</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OverviewCards;
