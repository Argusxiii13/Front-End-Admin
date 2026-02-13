import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";
import axios from 'axios';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

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
const AIPoweredInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsightsData = async () => {
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
          if (!booking.created_at) return false;
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= currentMonthStart && bookingDate <= currentMonthEnd;
        });

        const lastMonthBookings = bookings.filter(booking => {
          if (!booking.created_at) return false;
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd;
        });

        const currentMonthUsers = users.filter(user => {
          if (!user.created_at) return false;
          const userDate = new Date(user.created_at);
          return userDate >= currentMonthStart && userDate <= currentMonthEnd;
        });

        const lastMonthUsers = users.filter(user => {
          if (!user.created_at) return false;
          const userDate = new Date(user.created_at);
          return userDate >= lastMonthStart && userDate <= lastMonthEnd;
        });

        // Calculate percentage changes
        const calculatePercentageChange = (current, previous) => {
          if (current === 0 && previous === 0) return 0;
          if (previous === 0) return current > 0 ? 100 : -100;
          return ((current - previous) / previous) * 100;
        };

        const calculateRevenue = (bookingsToCalculate) => {
          const finishedConfirmedRevenue = bookingsToCalculate
            .filter(b => ['Finished', 'Confirmed'].includes(b.status))
            .reduce((sum, booking) => sum + (booking.price || 0), 0);

          const cancelledRevenue = bookingsToCalculate
            .filter(b => b.status === 'Cancelled')
            .reduce((sum, booking) => sum + (booking.cancel_fee || 0), 0);

          return finishedConfirmedRevenue + cancelledRevenue;
        };

        const revenueChange = calculatePercentageChange(
          calculateRevenue(currentMonthBookings),
          calculateRevenue(lastMonthBookings)
        );

        const usersChange = calculatePercentageChange(
          currentMonthUsers.length,
          lastMonthUsers.length
        );

        const bookingsChange = calculatePercentageChange(
          currentMonthBookings.length,
          lastMonthBookings.length
        );

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

        const netIncomeChange = calculatePercentageChange(
          calculateNetIncome(currentMonthBookings),
          calculateNetIncome(lastMonthBookings)
        );

        // Generate detailed insights based on percentage changes
        const dynamicInsights = [
          {
            icon: TrendingUp,
            color: revenueChange > 0 ? "text-green-500" : revenueChange < 0 ? "text-red-500" : "text-gray-500",
            insight: revenueChange > 0 
              ? `Revenue has increased by ${Math.abs(revenueChange).toFixed(1)}%, signifying a successful increase in bookings. Consider widening vehicle inventory for higher revenue potential.` 
              : revenueChange < 0 
              ? `Revenue has decreased by ${Math.abs(revenueChange).toFixed(1)}%, indicating a low rate of successful bookings. Consider lowering vehicle prices or investing in high-rated vehicles.` 
              : `Revenue remains unchanged. Keep up with the strategy and wait for changes.`
          },
          {
            icon: Users,
            color: usersChange > 0 ? "text-blue-500" : usersChange < 0 ? "text-red-500" : "text-gray-500",
            insight: usersChange > 0 
              ? `User base has grown by ${Math.abs(usersChange).toFixed(1)}%, indicating a successful promotion of the brand. Consider improving existing services for better user retention.` 
              : usersChange < 0 
              ? `User base has declined by ${Math.abs(usersChange).toFixed(1)}%, signifying a low market presence. Consider investing in promoting the brand.` 
              : `User base remains stable. Keep up with the strategy and wait for changes.`
          },
          {
            icon: ShoppingBag,
            color: bookingsChange > 0 ? "text-purple-500" : bookingsChange < 0 ? "text-red-500" : "text-gray-500",
            insight: bookingsChange > 0 
              ? `Total bookings have increased by ${Math.abs(bookingsChange).toFixed(1)}%, signaling a higher customer demand. Consider investing more in vehicle inventory for better booking rates.` 
              : bookingsChange < 0 
              ? `Total bookings have decreased by ${Math.abs(bookingsChange).toFixed(1)}%, suggesting a need for lower prices or additional features in vehicles.` 
              : `Total bookings remain unchanged. Keep monitoring the inventory levels.`
          },
          {
            icon: DollarSign,
            color: netIncomeChange > 0 ? "text-yellow-500" : netIncomeChange < 0 ? "text-red-500" : "text-gray-500",
            insight: netIncomeChange > 0 
              ? `Net income has improved by ${Math.abs(netIncomeChange).toFixed(1)}%, indicating a good income rate. Keep up the good work!` 
              : netIncomeChange < 0 
              ? `Net income has decreased by ${Math.abs(netIncomeChange).toFixed(1)}%, signifying a low income rate. Consider lowering expenses on each booking.` 
              : `Net income remains unchanged. Keep up with the strategy and wait for changes.`
          }
        ];

        setInsights(dynamicInsights);
      } catch (error) {
        setError('Failed to load insights.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsightsData();
  }, []);

  if (loading) {
    return (
      <motion.div
        className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <h2 className='text-xl font-semibold text-gray-100 mb-4'>Insights</h2>
        <div className='space-y-4'>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className='flex items-center space-x-3'>
              <div className='p-2 rounded-full bg-gray-700'>
                <div className='size-6 bg-gray-600 animate-pulse'></div>
              </div>
              <p className='text-gray-300 bg-gray-700 animate-pulse h-4 w-full'></p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
    >
      <h2 className='text-xl font-semibold text-gray-100 mb-4'>Insights</h2>
      <div className='space-y-4'>
        {insights.map((item, index) => (
          <div key={index} className='flex items-center space-x-3'>
            <div className={`p-2 rounded-full ${item.color} bg-opacity-20`}>
              <item.icon className={`size-6 ${item.color}`} />
            </div>
            <p className='text-gray-300'>{item.insight}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AIPoweredInsights;
