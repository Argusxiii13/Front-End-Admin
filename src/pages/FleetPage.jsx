import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingDown, TrendingUp, CarFront } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import FleetTable from "../components/fleet/FleetTable";
import FleetPieChart from '../components/fleet/FleetPieChart';
import FleetLineGraph from '../components/fleet/FleetLineGraph';

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

const FleetPage = () => {
  const [fleetStats, setFleetStats] = useState({
    totalVehicles: '0',
    mostRentedVehicle: 'Loading...',
    leastRentedVehicle: 'Loading...'
  });
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    statusDistribution: [],
    monthlyTrend: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFleetData = async () => {

        try {
            setIsLoading(true);
            
            // Fetch fleet statistics
            const fleetStatsResponse = await axios.get(`${apiUrl}/api/admin/fleet/statistics?role=${encodeURIComponent(role)}`);
            setFleetStats({
                totalVehicles: fleetStatsResponse.data.totalVehicles,
                mostRentedVehicle: fleetStatsResponse.data.mostRentedVehicle,
                leastRentedVehicle: fleetStatsResponse.data.leastRentedVehicle
            });

            // Fetch booking statistics
            const bookingStatsResponse = await axios.get(`${apiUrl}/api/admin/fleet/booking-stats?role=${encodeURIComponent(role)}`);
            setBookingStats({
                totalBookings: bookingStatsResponse.data.totalBookings,
                statusDistribution: bookingStatsResponse.data.statusDistribution,
                monthlyTrend: bookingStatsResponse.data.monthlyTrend
            });
            
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching fleet statistics:', err);
            setError('Failed to fetch fleet statistics');
            setIsLoading(false);
        }
    };

    fetchFleetData();
}, []); 

  if (error) {
    return (
      <div className='flex-1 relative z-10 overflow-auto'>
        <Header title={"Fleet"} />
        <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
          <div className='text-red-500 text-center'>
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='flex-1 relative z-10 overflow-auto'>
      <Header title={"Fleet Management"} />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name='Total Vehicle' 
            icon={CarFront} 
            value={isLoading ? 'Loading...' : fleetStats.totalVehicles} 
            color='#6366F1' 
            loading={isLoading}
          />
          <StatCard 
            name='Most Rented Vehicle' 
            icon={TrendingUp} 
            value={fleetStats.mostRentedVehicle} 
            color='#10B981' 
            loading={isLoading}
          />
          <StatCard 
            name='Least Rented Vehicle' 
            icon={TrendingDown} 
            value={fleetStats.leastRentedVehicle} 
            color='#b80000' 
            loading={isLoading}
          />
        </motion.div>

        <FleetTable />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8'>
        <FleetPieChart />
        <FleetLineGraph />
        </div>
      </main>
    </div>
  );
};

export default FleetPage;