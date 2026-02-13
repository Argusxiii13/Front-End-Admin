import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
const SalesOverviewChart = () => {
	const [monthlySalesData, setMonthlySalesData] = useState([]);
	const [selectedTimeRange, setSelectedTimeRange] = useState("This Week");
	const [dateRange, setDateRange] = useState([null, null]);
	const apiUrl = import.meta.env.VITE_API_URL;

	const fetchSalesData = async () => {
	
		try {
			const response = await fetch(`${apiUrl}/api/admin/sales/all-data?role=${encodeURIComponent(role)}`);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			processSalesData(data);
		} catch (error) {
		}
	};

	const processSalesData = (data) => {
		const revenueMap = {};

		// Process bookings data to calculate revenue
		data.forEach((booking) => {
			const createdAt = new Date(booking.created_at);
			const dateKey = createdAt.toISOString().split('T')[0]; // Format to YYYY-MM-DD

			if (booking.status === 'Confirmed' || booking.status === 'Finished') {
				revenueMap[dateKey] = (revenueMap[dateKey] || 0) + (booking.price || 0);
			} else if (booking.status === 'Cancelled') {
				revenueMap[dateKey] = (revenueMap[dateKey] || 0) + (booking.cancel_fee || 0);
			}
		});

		// Generate revenue data based on the selected time range
		setMonthlySalesData(generateRevenueData(revenueMap));
	};

	const generateRevenueData = (revenueMap) => {
		const today = new Date();
		const revenueData = [];
		const { start, end } = dateRange[0] && dateRange[1] 
			? { start: dateRange[0], end: dateRange[1] } 
			: calculateDateRange(selectedTimeRange, today);

		// Create a range of dates to ensure all days are represented
		for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
			const formattedDate = date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
			revenueData.push({
				date: formattedDate,
				sales: revenueMap[formattedDate] || 0, // Default to 0 if no data
			});
		}

		return revenueData;
	};

	const calculateDateRange = (timeRange, today) => {
		let start, end;

		switch (timeRange) {
			case "This Week":
				start = new Date(today);
				start.setDate(today.getDate() - today.getDay()); // Sunday
				end = new Date(today);
				end.setDate(today.getDate() + (6 - today.getDay())); // Saturday
				break;
			case "This Month":
				start = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the month
				end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the month
				break;
			case "This Quarter":
				const quarter = Math.floor(today.getMonth() / 3);
				start = new Date(today.getFullYear(), quarter * 3, 1); // First month of the quarter
				end = new Date(today.getFullYear(), (quarter + 1) * 3, 0); // Last month of the quarter
				break;
			case "This Year":
				start = new Date(today.getFullYear(), 0, 1); // First day of the year
				end = new Date(today.getFullYear(), 11, 31); // Last day of the year
				break;
			default:
				start = end = null;
		}

		return { start, end };
	};

	useEffect(() => {
		fetchSalesData();
	}, [apiUrl]);

	useEffect(() => {
		fetchSalesData(); // Re-fetch data when the selected time range changes
	}, [selectedTimeRange]);

	useEffect(() => {
		if (dateRange[0] && dateRange[1]) {
			fetchSalesData(); // Re-fetch data based on selected date range
		}
	}, [dateRange]);

	const handleDropdownChange = (e) => {
		setSelectedTimeRange(e.target.value);
		setDateRange([null, null]); // Clear the date picker when dropdown changes
	};

	const handleDateChange = (update) => {
		setDateRange(update);
	};

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-xl font-semibold text-gray-100'>Revenue Overview</h2>

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
					<AreaChart data={monthlySalesData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='date' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' />
						<Tooltip
							contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Area type='monotone' dataKey='sales' stroke='#8B5CF6' fill='#8B5CF6' fillOpacity={0.3} />
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default SalesOverviewChart;
