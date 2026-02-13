import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
const UsersGrowthRateVisualizer = () => {
    const [userData, setUserData] = useState([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState("This Week");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [dateRange, setDateRange] = useState([null, null]);


    const fetchData = async () => {
    try {
            const usersResponse = await fetch(`${apiUrl}/api/admin/analytics/users-data?role=${encodeURIComponent(role)}`);
            const bookingsResponse = await fetch(`${apiUrl}/api/admin/analytics/bookings-data?role=${encodeURIComponent(role)}`);
    
            if (!usersResponse.ok || !bookingsResponse.ok) {
                throw new Error("Network response was not ok");
            }
    
            const [usersData, bookingsData] = await Promise.all([
                usersResponse.json(),
                bookingsResponse.json()
            ]);
    
            processUserData(usersData, bookingsData);
        } catch (error) {
        }
    };

    const processUserData = (users, bookings) => {
        const registrationMap = {};
        const bookingUsersMap = {};

        const userIdsWithBookings = new Set(bookings.map(booking => booking.userid));

        users.forEach((user) => {
            const createdAt = new Date(user.created_at);
            const dateKey = createdAt.toISOString().split('T')[0];

            registrationMap[dateKey] = (registrationMap[dateKey] || 0) + 1;

            if (userIdsWithBookings.has(user.id)) {
                bookingUsersMap[dateKey] = (bookingUsersMap[dateKey] || 0) + 1;
            }
        });

        setUserData(generateUserData(registrationMap, bookingUsersMap));
    };

    const generateUserData = (registrationMap, bookingUsersMap) => {
        const today = new Date();
        const userDataArray = [];

        let start, end;
        if (dateRange[0] && dateRange[1]) {
            start = new Date(dateRange[0]);
            end = new Date(dateRange[1]);
        } else {
            const range = calculateDateRange(selectedTimeRange, today, selectedMonth);
            start = range.start;
            end = range.end;
        }

        const datesToInclude = new Set();
        datesToInclude.add(start.toLocaleDateString('en-CA')); // YYYY-MM-DD
        datesToInclude.add(end.toLocaleDateString('en-CA'));

        for (const date in registrationMap) {
            datesToInclude.add(date);
        }

        const currentDate = new Date(start);
        while (currentDate <= end) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            if (datesToInclude.has(formattedDate)) {
                const registeredUsers = registrationMap[formattedDate] || 0;
                const usersWithBookings = bookingUsersMap[formattedDate] || 0;

                userDataArray.push({
                    date: formattedDate,
                    registeredUsers: registeredUsers,
                    usersWithBookings: usersWithBookings
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return userDataArray;
    };

    const calculateDateRange = (timeRange, today, selectedMonth) => {
        let start, end;

        if (selectedMonth) {
            const [year, month] = selectedMonth.split('-');
            start = new Date(parseInt(year), parseInt(month) - 1, 1);
            end = new Date(parseInt(year), parseInt(month), 0);
            return { start, end };
        }

        switch (timeRange) {
            case "This Week":
                start = new Date(today);
                start.setDate(today.getDate() - today.getDay());
                end = new Date(today);
                end.setDate(today.getDate() + (6 - today.getDay()));
                break;
            case "This Month":
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case "This Quarter":
                const quarter = Math.floor(today.getMonth() / 3);
                start = new Date(today.getFullYear(), quarter * 3, 1);
                end = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case "This Year":
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
            default:
                start = end = null;
        }

        return { start, end };
    };

    useEffect(() => {
        fetchData();
    }, [apiUrl, selectedTimeRange, selectedMonth, dateRange]);

    const handleDropdownChange = (e) => {
        setSelectedTimeRange(e.target.value);
        setDateRange([null, null]);
        setSelectedMonth(""); 
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setSelectedTimeRange(""); 
        setDateRange([null, null]); 
    };

    const handleDateChange = (update) => {
        const [start, end] = update;
        setDateRange(update);
        
        if (start && end) {
            setSelectedTimeRange(""); 
            setSelectedMonth(""); 
        }
    };

    const generateMonthOptions = () => {
        const months = [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        
        for (let month = 0; month < 12; month++) {
            const monthValue = String(month + 1).padStart(2, '0');
            months.push(`${currentYear}-${monthValue}`);
        }
        
        return months;
    };

    const monthOptions = generateMonthOptions();

    // Calculate max Y value for Y-axis
    const maxRegisteredUsers = Math.max(...userData.map(data => data.registeredUsers), 1);
    const maxUsersWithBookings = Math.max(...userData.map(data => data.usersWithBookings), 1);
    const maxYValue = Math.max(maxRegisteredUsers, maxUsersWithBookings);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>User Growth Rate Visualizer</h2>

                <div className='flex items-center'>
                    <select
                        className='bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4'
                        value={selectedTimeRange}
                        onChange={handleDropdownChange}
                    >
                        <option value="">Select Time Range</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>This Quarter</option>
                        <option>This Year</option>
                    </select>

                    <select
                        className='bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4'
                        value={selectedMonth}
                        onChange={handleMonthChange}
                    >
                        <option value="">Select Month</option>
                        {monthOptions.map(month => (
                            <option key={month} value={month}>
                                {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </option>
                        ))}
                    </select>

                    <DatePicker
                        selectsRange
                        startDate={dateRange[0]}
                        endDate={dateRange[1]}
                        onChange={handleDateChange}
                        isClearable
                        placeholderText="Select Date Range"
                        className='bg-gray-700 text-white rounded-md px-3 py-1 w-64'
                        dateFormat="yyyy-MM-dd"
                        customInput={
                            <input 
                                className='bg-gray-700 text-white rounded-md px-3 py-1 w-64 cursor-pointer'
                                readOnly
                            />
                        }
                    />
                </div>
            </div>

            <div className='w-full h-[500px]'>
                <ResponsiveContainer>
                    <AreaChart data={userData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis dataKey='date' stroke='#9CA3AF' />
                        <YAxis 
                            stroke='#9CA3AF' 
                            domain={[0, maxYValue]} 
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Area type='monotone' dataKey='registeredUsers' stroke='#4ADE80' fill='#4ADE80' fillOpacity={0.3} name="Registered Users" />
                        <Area type='monotone' dataKey='usersWithBookings' stroke='#60A5FA' fill='#60A5FA' fillOpacity={0.3} name="Users Booked At Least Once" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-center mt-4">
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-[#4ADE80] mr-2 rounded-full"></span>
                    <span className="text-gray-100">Registered Users</span>
                    <span className="w-3 h-3 bg-[#60A5FA] ml-4 mr-2 rounded-full"></span>
                    <span className="text-gray-100">Users Booked At Least Once</span>
                </div>
            </div>
        </motion.div>
    );
};

export default UsersGrowthRateVisualizer;
