import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
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
const COLOR_MAP = {
    Cancelled: "#FF0000", // Red
    Pending: "#F59E0B",   // Yellow
    Confirmed: "#6366F1", // Blue
    Finished: "#10B981",  // Green
};

const BookingsPieChart = () => {
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/bookings/pie-chart?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCategoryData(data);
            } catch (error) {
            }
        };

        fetchCategoryData();
    }, []);

    const currentYear = new Date().getFullYear(); // Get the current year

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className="text-lg font-medium mb-4 text-gray-100">Bookings Status Overview for {currentYear}</h2>
            <div className="h-100">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="80%"
                            innerRadius="60%" // Added this line to create the doughnut effect
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {categoryData.map((entry) => (
                                <Cell key={entry.name} fill={COLOR_MAP[entry.name] || '#8884d8'} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default BookingsPieChart;
