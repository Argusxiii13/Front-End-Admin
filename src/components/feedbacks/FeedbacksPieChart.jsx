import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
const COLOR_MAP = {
    5: "#10B981",   // Green
    4: "#6366F1",   // Blue
    3: "#F59E0B",   // Yellow
    2: "#FFA500",   // Orange
    1: "#FF0000",   // Red
    0: "#FF0000",   // Red for 0 stars
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const rating = payload[0].name.split(' ')[0]; // Get the star rating
        const count = payload[0].value; // Get the count of feedbacks
        return (
            <div className="custom-tooltip" style={tooltipStyle}>
                <p style={tooltipTextStyle}>{`${count} Feedbacks have given ${rating} Star Rating to one of our vehicles`}</p>
            </div>
        );
    }
    return null;
};

// Styles for the tooltip
const tooltipStyle = {
    backgroundColor: 'rgba(31, 41, 55, 0.9)', // Dark background
    border: '1px solid #4B5563',               // Border color
    borderRadius: '8px',                       // Rounded corners
    padding: '10px',                           // Padding
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // Shadow for depth
};

const tooltipTextStyle = {
    color: '#E5E7EB', // Light text color
    margin: 0,       // Remove default margin
};

const FeedbacksPieChart = () => {
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        const fetchCategoryData = async () => {
        
            try {
                const response = await fetch(`${apiUrl}/api/admin/feedback/feedback-piechart?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                
                // Process data to get star rating counts
                const ratingCounts = Array(6).fill(0);
                data.forEach(feedback => {
                    if (feedback.rating >= 0 && feedback.rating <= 5) {
                        ratingCounts[feedback.rating]++;
                    }
                });
        
                // Prepare the data for the pie chart
                const processedData = ratingCounts.map((count, index) => ({
                    name: `${index} Star`,
                    value: count,
                })).filter(entry => entry.value > 0); // Filter out zero values
        
                setCategoryData(processedData);
            } catch (error) {
            }
        };

        fetchCategoryData();
    }, []);

    const currentYear = new Date().getFullYear();

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className="text-lg font-medium mb-4 text-gray-100">Feedback Ratings Overview for {currentYear}</h2>
            <div className="h-100">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="80%"
                            innerRadius="60%"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {categoryData.map((entry) => (
                                <Cell key={entry.name} fill={COLOR_MAP[entry.name.split(' ')[0]] || '#8884d8'} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default FeedbacksPieChart;
