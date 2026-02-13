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
  const role = adminInfo.admin_role || 'RAR'; // Provide a default value if role is not found
const COLOR_MAP = {
    Registered: "#10B981", // Green for Registered Users
};

const UserLineGraph = () => {
    const [userData, setUserData] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/user/line-graph?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUserData(data); // Set the fetched data directly
            } catch (error) {
            }
        };
    
        fetchUserData();
    }, []); // Adjust the dependency array if necessary

    // Get unique registered user counts for Y-axis ticks
    const uniqueTicks = Array.from(new Set(userData.map(item => item.registered_users)));

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className="text-lg font-medium mb-4 text-gray-100">Registered Users Line Graph for {new Date().getFullYear()}</h2>
            <div className="h-100">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis 
                            domain={[0, 'dataMax']} // Dynamic maximum, minimum starts at 0
                            ticks={uniqueTicks} // Use unique ticks from the dataset
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="registered_users" 
                            stroke={COLOR_MAP.Registered} 
                            activeDot={{ r: 8 }} 
                            name="Registered Users" // Set the legend name
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default UserLineGraph;
