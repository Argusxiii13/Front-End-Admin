import { useEffect, useState } from 'react';
import { MessageCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import FeedbacksTable from "../components/feedbacks/FeedbacksTable";
import FeedbacksPieChart from '../components/feedbacks/FeedbacksPieChart';
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

const FeedbacksPage = () => {
  const [feedbackStats, setFeedbackStats] = useState({ 
    totalFeedbacks: 0, 
    bookingsWithoutFeedback: 0,
    feedbackData: [] 
  });
  const [bookingStats, setBookingStats] = useState([]);
  const [highestRatedVehicle, setHighestRatedVehicle] = useState(null);
  const [carsDetail, setCarsDetail] = useState({});

  useEffect(() => {
    const fetchCarsDetail = async () => {
      try {
          const response = await fetch(`${apiUrl}/api/admin/feedback/cars-detail?role=${encodeURIComponent(role)}`);
          const data = await response.json();
          const carsMap = data.reduce((acc, car) => {
              acc[car.id] = car;
              return acc;
          }, {});
          setCarsDetail(carsMap);
      } catch (error) {
          console.error('Error fetching cars detail:', error);
      }
  };

  const fetchFeedbackStats = async () => {

    try {
        const response = await fetch(`${apiUrl}/api/admin/feedback/feedback-stats?role=${encodeURIComponent(role)}`);
        const data = await response.json();

        setFeedbackStats(prevStats => ({
            ...prevStats,
            totalFeedbacks: data.length,
            feedbackData: data
        }));

        const vehicleRatings = data.reduce((acc, feedback) => {
            const carId = feedback.car_id;
            if (!acc[carId]) {
                acc[carId] = {
                    totalRating: 0,
                    count: 0
                };
            }
            acc[carId].totalRating += feedback.rating;
            acc[carId].count += 1;
            return acc;
        }, {});

        let highestRated = { car_id: null, averageRating: 0 };
        Object.entries(vehicleRatings).forEach(([carId, stats]) => {
            const averageRating = stats.totalRating / stats.count;
            if (averageRating > highestRated.averageRating) {
                highestRated = {
                    car_id: carId,
                    averageRating: averageRating
                };
            }
        });

        if (highestRated.car_id) {
            setHighestRatedVehicle(highestRated);
        }
    } catch (error) {
        console.error('Error fetching feedback stats:', error);
    }
};

const fetchBookingStats = async () => {

  try {
      const response = await fetch(`${apiUrl}/api/admin/feedback/booking-stats?role=${encodeURIComponent(role)}`);
      const data = await response.json();
      setBookingStats(data);

      const bookingsWithoutFeedback = data.filter(
          booking => !feedbackStats.feedbackData.some(
              feedback => feedback.booking_id === booking.booking_id
          )
      ).length;

      setFeedbackStats(prevStats => ({
          ...prevStats,
          bookingsWithoutFeedback
      }));
  } catch (error) {
      console.error('Error fetching booking stats:', error);
  }
};

    fetchCarsDetail();
    fetchFeedbackStats();
    fetchBookingStats();
  }, []);

  const getHighestRatedVehicleDisplay = () => {
    if (!highestRatedVehicle || !carsDetail[highestRatedVehicle.car_id]) {
      return 'N/A';
    }
    const car = carsDetail[highestRatedVehicle.car_id];
    return `${car.plate_num} (${highestRatedVehicle.averageRating.toFixed(1)}/5)`;
  };

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Feedback Management' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name='Total Feedbacks'
            icon={MessageCircle}
            value={feedbackStats.totalFeedbacks?.toLocaleString() || 0}
            color='#6366F1'
          />
          <StatCard 
            name='Bookings Without Feedback' 
            icon={MessageCircle} 
            value={feedbackStats.bookingsWithoutFeedback?.toLocaleString() || 0} 
            color='#F59E0B' 
          />
          <StatCard 
            name='Highest Rated Vehicle' 
            icon={TrendingUp} 
            value={getHighestRatedVehicleDisplay()} 
            color='#10B981' 
          />
        </motion.div>

        <FeedbacksTable />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
          <FeedbacksPieChart/>
        </div>
      </main>
    </div>
  );
};

export default FeedbacksPage;