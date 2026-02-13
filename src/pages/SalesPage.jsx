import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { Ban, Handshake, Calculator } from "lucide-react";
import NetIncomeOverviewChart from "../components/sales/NetIncomeOverviewChart";
import SalesTable from "../components/sales/SalesTable";

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

const SalesPage = () => {
  const [salesStats, setSalesStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesStats = async () => {

        try {
            const response = await fetch(`${apiUrl}/api/admin/sales/sales-statistics?role=${encodeURIComponent(role)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok'); 
            }
            const data = await response.json();
            setSalesStats(data);
        } catch (error) {
            setError('Failed to load sales statistics. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    fetchSalesStats();
}, []);

  if (loading) {
    return (
      <div className='flex-1 overflow-auto relative z-10'>
        <Header title='Sales Overview' />
        <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
            {[1, 2, 3].map((item) => (
              <StatCard 
                key={item}
                name='Loading...' 
                icon={Handshake} 
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
        <Header title='Sales Overview' />
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
      <Header title='Sales Overview' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* SALES STATS */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name='Total Revenue' 
            icon={Handshake} 
            value={`₱${salesStats.totalRevenue || 0}`} 
            color='#6366F1' 
          />
          <StatCard 
            name='Net Income' 
            icon={Calculator} 
            value={`₱${salesStats.netIncome || 0}`} 
            color={salesStats.netIncome > 0 ? '#10B981' : '#EF4444'} 
          />
          <StatCard 
            name='Cancelled Earning' 
            icon={Ban} 
            value={`₱${salesStats.cancelledEarning || 0}`} 
            color='#EF4444' 
          />
        </motion.div>

        <SalesTable />
        <div className='grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8 mt-5'>
          <NetIncomeOverviewChart />
        </div>
      </main>
    </div>
  );
};

export default SalesPage;
