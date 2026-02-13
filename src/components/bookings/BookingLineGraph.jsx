import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
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
const COLOR_MAP = {
    Cancelled: "#FF0000", // Red
    Pending: "#F59E0B",   // Yellow
    Confirmed: "#6366F1", // Blue
    Finished: "#10B981",  // Green
};

const BookingsLineGraph = () => {
    const [bookingData, setBookingData] = useState([]);

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/booking/line-graph?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                processBookingData(data); // Process data after fetching
            } catch (error) {
            }
        };

        fetchBookingData();
    }, []);

    const processBookingData = (data) => {
        const filledData = [];
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1); // January 1 of the current year
        const endDate = new Date(currentYear, 11, 31); // December 31 of the current year

        // Create a map to hold counts for each date
        const categoryData = data.reduce((acc, row) => {
            const date = new Date(row.date); // Create a Date object
            const formattedDate = date.toLocaleDateString('en-CA'); // Format to YYYY-MM-DD
            const status = row.status;
            const count = parseInt(row.count, 10);

            if (!acc[formattedDate]) {
                acc[formattedDate] = { date: formattedDate, Pending: 0, Confirmed: 0, Cancelled: 0 }; // Initialize all statuses
            }
            acc[formattedDate][status] = count; // Set the count for the corresponding status

            return acc;
        }, {});

        // Fill in the starting and ending dates
        const startDateStr = startDate.toLocaleDateString('en-CA');
        const endDateStr = endDate.toLocaleDateString('en-CA');

        // Add starting date
        filledData.push({
            date: startDateStr,
            Pending: categoryData[startDateStr]?.Pending || 0,
            Confirmed: categoryData[startDateStr]?.Confirmed || 0,
            Cancelled: categoryData[startDateStr]?.Cancelled || 0,
        });

        // Add intermediate dates with data
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toLocaleDateString('en-CA');
            if (categoryData[dateStr]) {
                filledData.push(categoryData[dateStr]);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Add ending date
        filledData.push({
            date: endDateStr,
            Pending: categoryData[endDateStr]?.Pending || 0,
            Confirmed: categoryData[endDateStr]?.Confirmed || 0,
            Cancelled: categoryData[endDateStr]?.Cancelled || 0,
        });

        setBookingData(filledData); // Update the state with processed data
    };

    const getUniqueTicks = (data) => {
        const uniqueValues = new Set();
        data.forEach(item => {
            uniqueValues.add(item.Pending);
            uniqueValues.add(item.Confirmed);
            uniqueValues.add(item.Cancelled);
        });
        return Array.from(uniqueValues).filter(value => value >= 0).sort((a, b) => a - b); // Filter only non-negative values and sort
    };

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className="text-lg font-medium mb-4 text-gray-100">Bookings Status Line Graph for {new Date().getFullYear()}</h2>
            <div className="h-100">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={bookingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis 
                            ticks={getUniqueTicks(bookingData)} // Get unique tick values from data
                            domain={[0, 'dataMax']} // Set minimum to 0 and dynamic maximum
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Legend />
                        {Object.keys(COLOR_MAP).map((status) => (
                            <Line 
                                key={status}
                                type="monotone" 
                                dataKey={status} 
                                stroke={COLOR_MAP[status]} 
                                activeDot={{ r: 8 }} 
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default BookingsLineGraph;
