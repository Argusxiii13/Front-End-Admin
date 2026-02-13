import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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
const FeedbackVisualizer = () => {
    const [feedbackData, setFeedbackData] = useState([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState("This Week");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [dateRange, setDateRange] = useState([null, null]);
    const [carMap, setCarMap] = useState({});


    // Generate random colors for lines
    const generateColor = () => {
        const colors = ['#4ADE80', '#60A5FA', '#F472B6', '#FB923C', '#A78BFA', '#34D399', '#F87171'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const fetchData = async () => {   
        try {
            const [carsResponse, feedbackResponse] = await Promise.all([
                fetch(`${apiUrl}/api/admin/analytics/cars-data?role=${encodeURIComponent(role)}`),
                fetch(`${apiUrl}/api/admin/analytics/feedback-data?role=${encodeURIComponent(role)}`)
            ]);
    
            if (!carsResponse.ok || !feedbackResponse.ok) {
                throw new Error("Network response was not ok");
            }
    
            const [carsData, feedbackData] = await Promise.all([
                carsResponse.json(),
                feedbackResponse.json()
            ]);
    
            // Create car mapping
            const carMapping = {};
            carsData.forEach(car => {
                carMapping[car.id] = {
                    plateNum: car.plate_num,
                    color: generateColor()
                };
            });
            setCarMap(carMapping);
    
            processData(feedbackData, carMapping);
        } catch (error) {
        }
    };

    const processData = (feedback, carMapping) => {
        const feedbackMap = {};
    
        // Get date range for filtering
        const { start, end } = dateRange[0] && dateRange[1] 
            ? { start: new Date(dateRange[0]), end: new Date(dateRange[1]) } 
            : calculateDateRange(selectedTimeRange, new Date(), selectedMonth);
    
        // Group feedback by date and car
        feedback.forEach(item => {
            // Parse the created_at timestamp
            const createdAt = new Date(item.created_at);
    
            // Convert to local date string for comparison (YYYY-MM-DD)
            const dateKey = createdAt.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format
    
            // Check if the created date falls within the selected range
            if (createdAt >= start && createdAt <= end) {
                if (!feedbackMap[dateKey]) {
                    feedbackMap[dateKey] = {};
                }
                if (!feedbackMap[dateKey][item.car_id]) {
                    feedbackMap[dateKey][item.car_id] = {
                        count: 0,
                        total: 0
                    };
                }
                feedbackMap[dateKey][item.car_id].count++;
                feedbackMap[dateKey][item.car_id].total += item.rating;
            }
        });
    
        // Prepare final data including only start and end date
        const processedData = [];
        const datesToInclude = new Set();
        datesToInclude.add(start.toLocaleDateString('en-CA'));
        datesToInclude.add(end.toLocaleDateString('en-CA'));
    
        Object.keys(feedbackMap).forEach(date => {
            datesToInclude.add(date);
        });
    
        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dateKey = currentDate.toLocaleDateString('en-CA');
            if (datesToInclude.has(dateKey)) {
                const dataPoint = { date: dateKey };
                Object.keys(carMapping).forEach(carId => {
                    if (feedbackMap[dateKey] && feedbackMap[dateKey][carId]) {
                        const { count, total } = feedbackMap[dateKey][carId];
                        dataPoint[carId] = total / count; // Average rating
                    } else {
                        dataPoint[carId] = 0; // No feedback, set to 0
                    }
                });
                processedData.push(dataPoint);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    
        setFeedbackData(processedData);
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

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Feedback Rating Visualizer</h2>

                <div className="flex items-center">
                    <select
                        className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
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
                        className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
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
                        className="bg-gray-700 text-white rounded-md px-3 py-1 w-64"
                        dateFormat="yyyy-MM-dd"
                        customInput={
                            <input 
                                className="bg-gray-700 text-white rounded-md px-3 py-1 w-64 cursor-pointer"
                                readOnly
                            />
                        }
                    />
                </div>
            </div>

            <div className="w-full h-[500px]">
                <ResponsiveContainer>
                    <LineChart data={feedbackData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={[0, 5]} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Legend />
                        {Object.entries(carMap).map(([carId, details]) => (
                            <Line
                                key={carId}
                                type="monotone"
                                dataKey={carId}
                                stroke={details.color}
                                name={details.plateNum}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default FeedbackVisualizer;
