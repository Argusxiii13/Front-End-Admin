import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

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
const FleetLineGraph = () => {
    const [rentalData, setRentalData] = useState([]);

    useEffect(() => {
        const fetchRentalData = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/fleet/line-graph?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRentalData(data);
            } catch (error) {
            }
        };
    
        fetchRentalData();
    }, []);

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Create start and end dates for the entire year
    const startDate = new Date(currentYear, 0, 1); // January 1st
    const endDate = new Date(currentYear, 11, 31); // December 31st

    // Format dates
    const startDateString = startDate.toLocaleDateString('en-CA');
    const endDateString = endDate.toLocaleDateString('en-CA');

    // Prepare the data
    const chartData = rentalData.reduce((acc, { date, car, rental_days }) => {
        if (!acc[date]) {
            acc[date] = { date };
        }
        acc[date][car] = rental_days;
        return acc;
    }, {});

    // Create the final data array
    const finalData = Object.values(chartData);

    // Create start and end date entries
    const startDateEntry = { date: startDateString };
    const endDateEntry = { date: endDateString };

    // Determine unique cars
    const uniqueCars = [...new Set(rentalData.map(item => item.car))];

    // Add zero values for cars to start and end date entries
    uniqueCars.forEach(car => {
        startDateEntry[car] = 0;
        endDateEntry[car] = 0;
    });

    // Combine and sort the data
    const completeData = [startDateEntry, ...finalData, endDateEntry]
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Define colors for cars
    const colors = ["#10B981", "#3B82F6", "#FBBF24", "#EF4444", "#8B5CF6", "#34D399", "#F472B6", "#6366F1", "#F97316", "#6EE7B7"];
    const carLines = {};
    let colorIndex = 0;

    uniqueCars.forEach(car => {
        carLines[car] = colors[colorIndex % colors.length];
        colorIndex++;
    });

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className="text-lg font-medium mb-4 text-gray-100">Fleet Rental Days Line Graph for {currentYear}</h2>
            <div className="h-100">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={completeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(dateString) => new Date(dateString).toLocaleDateString('en-CA')}
                        />
                        <YAxis 
                            domain={[0, 'dataMax']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Legend />
                        {uniqueCars.map(car => (
                            <Line 
                                key={car} 
                                type="monotone" 
                                dataKey={car} 
                                stroke={carLines[car]} 
                                activeDot={{ r: 8 }} 
                                name={car}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default FleetLineGraph;
