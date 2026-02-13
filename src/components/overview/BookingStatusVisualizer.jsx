import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
const BookingStatusVisualizer = () => {
    const [bookingData, setBookingData] = useState([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState("This Week");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [dateRange, setDateRange] = useState([null, null]);

    const fetchBookingsData = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/analytics/bookings-data?role=${encodeURIComponent(role)}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            processBookingsData(data);
        } catch (error) {
        }
    };

    const processBookingsData = (data) => {
        const statusMap = {};
    
        data.forEach((booking) => {
            const createdAt = new Date(booking.created_at);
            const formattedDate = createdAt.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            const status = booking.status;
    
            if (!statusMap[formattedDate]) {
                statusMap[formattedDate] = { Cancelled: 0, Pending: 0, Confirmed: 0, Finished: 0 };
            }
    
            if (statusMap[formattedDate][status] !== undefined) {
                statusMap[formattedDate][status]++;
            }
        });
    
        setBookingData(generateBookingData(statusMap));
    };

    const generateBookingData = (statusMap) => {
        const today = new Date();
        const { start, end } = dateRange[0] && dateRange[1] 
            ? { start: dateRange[0], end: dateRange[1] } 
            : calculateDateRange(selectedTimeRange, today, selectedMonth);
        
        const bookingDataArray = [];
    
        // Helper function to format dates
        const formatDate = (date) => date.toLocaleDateString('en-CA');
    
        // Include start date
        const startFormatted = formatDate(start);
        const endFormatted = formatDate(end);
    
        // Add starting date with its statuses
        const startStatuses = statusMap[startFormatted] || { Finished: 0, Confirmed: 0, Pending: 0, Cancelled: 0 };
        bookingDataArray.push({
            date: startFormatted,
            Finished: startStatuses.Finished,
            Confirmed: startStatuses.Confirmed,
            Pending: startStatuses.Pending,
            Cancelled: startStatuses.Cancelled
        });
    
        // Iterate through each date in the range
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const formattedDate = formatDate(date);
            
            // Skip if the date is neither the start nor the end date and has no bookings
            if (formattedDate !== startFormatted && formattedDate !== endFormatted) {
                const statuses = statusMap[formattedDate] || {
                    Finished: 0,
                    Confirmed: 0,
                    Pending: 0,
                    Cancelled: 0
                };
    
                // Only add the date if there are bookings on that date
                if (statuses.Finished > 0 || statuses.Confirmed > 0 || statuses.Pending > 0 || statuses.Cancelled > 0) {
                    bookingDataArray.push({
                        date: formattedDate,
                        Finished: statuses.Finished,
                        Confirmed: statuses.Confirmed,
                        Pending: statuses.Pending,
                        Cancelled: statuses.Cancelled
                    });
                }
            }
        }
    
        // Include end date with its statuses
        const endStatuses = statusMap[endFormatted] || { Finished: 0, Confirmed: 0, Pending: 0, Cancelled: 0 };
        bookingDataArray.push({
            date: endFormatted,
            Finished: endStatuses.Finished,
            Confirmed: endStatuses.Confirmed,
            Pending: endStatuses.Pending,
            Cancelled: endStatuses.Cancelled
        });
    
        return bookingDataArray;
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
        fetchBookingsData();
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
        setDateRange(update);
        if (update[0] && update[1]) {
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

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Booking Status Visualizer</h2>

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
                    <BarChart data={bookingData} stackId="a">
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='date' />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#374151', 
                                color: '#ffffff', 
                                borderRadius: '0.5rem', 
                                border: 'none' 
                            }}
                            cursor={{ fill: 'rgba(255,255,255,0.1)' }} 
                        />
                        <Legend />
                        <Bar dataKey='Finished' stackId="a" fill="#60A5FA" name="Finished" />
                        <Bar dataKey='Confirmed' stackId="a" fill="#4ADE80" name="Confirmed" />
                        <Bar dataKey='Pending' stackId="a" fill="#FBBF24" name="Pending" />
                        <Bar dataKey='Cancelled' stackId="a" fill="#F87171" name="Cancelled" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default BookingStatusVisualizer;
