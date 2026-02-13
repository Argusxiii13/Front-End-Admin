import { useState, useEffect } from 'react';
import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import UsersTable from "../components/users/UsersTable";
import UserPieChart from '../components/users/UserPieChart';
import UserLineGraph from '../components/users/UserLineGraph';
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
const role = adminInfo.admin_role || 'RAR'; // Provide a default value if role is not found

const UsersPage = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserStatistics = async () => {
      try {
          setIsLoading(true);
          const response = await fetch(`${apiUrl}/api/admin/users/statistics?role=${encodeURIComponent(role)}`);
          
          if (!response.ok) {
              throw new Error('Failed to fetch user statistics');
          }
          
          const data = await response.json();
          setUserStats(data);
      } catch (err) {
          setError(err.message || 'An unknown error occurred');
      } finally {
          setIsLoading(false);
      }
  };

    fetchUserStatistics();
  }, []);

  if (isLoading) {
    return (
      <div className='flex-1 overflow-auto relative z-10'>
        <Header title='Users' />
        <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
            {[1, 2, 3, 4].map((item) => (
              <StatCard 
                key={item} 
                name='Loading...' 
                icon={UsersIcon} 
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
        <Header title='Users' />
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
      <Header title='Users Management' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name='Total Users'
            icon={UsersIcon}
            value={userStats.totalUsers.toLocaleString()}
            color='#6366F1'
          />
          <StatCard 
            name='New Users Today' 
            icon={UserPlus} 
            value={userStats.newUsersToday.toString()} 
            color='#10B981' 
          />
          <StatCard
            name='Active Users'
            icon={UserCheck}
            value={userStats.activeUsers.toLocaleString()}
            color='#F59E0B'
          />
          <StatCard 
            name='Inactive Users' 
            icon={UserX} 
            value={userStats.inactiveUsers.toLocaleString()} 
            color='#EF4444' 
          />
        </motion.div>

        <UsersTable />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
          <UserPieChart />
          <UserLineGraph />
        </div>
      </main>
    </div>
  );
};

export default UsersPage;
