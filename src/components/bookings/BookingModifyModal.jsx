import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

const BookingModifyModal = ({ booking, isOpen, onClose }) => {
    console.log(booking);
    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [formData, setFormData] = useState({
        pickup_location: '',
        pickup_date: '',
        pickup_time: '',
        return_location: '',
        return_date: '',
        return_time: '',
        rental_type: '',
        additionalrequest: '',
        status: ''
    });

    const rentalTypeOptions = [
        { label: "For Personal", value: "personal" },
        { label: "For Company", value: "company" }
    ];
    const statusOptions = ["Pending", "Confirmed", "Cancelled", "Finished"];

    // Function to format date for input fields
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Return date in YYYY-MM-DD format
    };

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/booking/car-dropdown?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCars(data);
            } catch (error) {
                console.error('Error fetching car data:', error);
            }
        };

        fetchCars();
    }, []);

    useEffect(() => {
        if (booking) {
            setSelectedCarId(booking.car_id || '');
            setFormData({
                pickup_location: booking.pickup_location,
                pickup_date: formatDate(booking.pickup_date), // Use the updated formatDate
                pickup_time: booking.pickup_time,
                return_location: booking.return_location,
                return_date: formatDate(booking.return_date), // Use the updated formatDate
                return_time: booking.return_time,
                rental_type: booking.rental_type,
                additionalrequest: booking.additionalrequest,
                status: booking.status || ''
            });
        }
    }, [booking]);

    if (!isOpen || !booking) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedBooking = {
            car_id: selectedCarId,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            ...formData,
            admin_id: adminInfo.admin_id,
            admin_name: adminInfo.admin_name,
            admin_role: adminInfo.admin_role,
        };

        try {
            const response = await fetch(`${apiUrl}/api/admin/booking/update/${booking.booking_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedBooking),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            onClose();
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };

    return createPortal(
        <div className="modal">
            <div className="modal-content w-700 h-700 overflow-auto">
                <h2 className="modal-title text-lg font-semibold mb-4">Modify Booking</h2>
                <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-gray-400">Booking ID</label>
                        <input type="text" value={booking.booking_id} className="modal-input" disabled />
                    </div>
                    <div>
                        <label className="text-gray-400">User ID</label>
                        <input type="text" value={booking.userid} className="modal-input" disabled />
                    </div>
                    <div>
                        <label className="text-gray-400">Car</label>
                        <select
                            className="modal-input"
                            value={selectedCarId}
                            onChange={(e) => setSelectedCarId(e.target.value)}
                        >
                            {cars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.model} {car.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400">Name</label>
                        <input type="text" value={booking.name} className="modal-input" disabled />
                    </div>
                    <div>
                        <label className="text-gray-400">E-Mail</label>
                        <input type="email" value={booking.email} className="modal-input" disabled />
                    </div>
                    <div>
                        <label className="text-gray-400">Phone</label>
                        <input type="text" value={booking.phone} className="modal-input" disabled />
                    </div>
                    <div>
                        <label className="text-gray-400">Pickup Location</label>
                        <input 
                            type="text" 
                            name="pickup_location" 
                            value={formData.pickup_location} 
                            onChange={handleChange} 
                            className="modal-input" 
                        />
                    </div>
                    <div>
                        <label className="text-gray-400">Pickup Date</label>
                        <input 
                            type="date" 
                            name="pickup_date" 
                            value={formData.pickup_date} 
                            onChange={handleChange} 
                            className="modal-input" 
                        />
                    </div>
                    <div>
                        <label className="text-gray-400">Pickup Time</label>
                        <input 
                            type="time" 
                            name="pickup_time" 
                            value={formData.pickup_time} 
                            onChange={handleChange} 
                            className="modal-input" 
                        />
                    </div>
                    <div>
                        <label className="text-gray-400">Return Location</label>
                        <input 
                            type="text" 
                            name="return_location" 
                            value={formData.return_location} 
                            onChange={handleChange} 
                            className="modal-input" 
                        />
                    </div>
                    <div>
                        <label className="text-gray-400">Return Date</label>
                        <input 
                            type="date" 
                            name="return_date" 
                            value={formData.return_date} 
                            onChange={handleChange} 
                            className="modal-input" 
                        />
                    </div>
                    <div>
                        <label className="text-gray-400">Return Time</label>
                        <input 
                            type="time" 
                            name="return_time" 
                            value={formData.return_time} 
                            onChange={handleChange} 
                            className="modal-input" 
                        />
                    </div>
                    <div>
                        <label className="text-gray-400">Rental Type</label>
                        <select
                            className="modal-input"
                            name="rental_type"
                            value={formData.rental_type}
                            onChange={handleChange}
                        >
                            {rentalTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400">Status</label>
                        <select
                            className="modal-input"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400">Price Accepted</label>
                        <input type="text" value={booking.priceaccepted ? "Yes" : "No"} className="modal-input" disabled />
                    </div>
                    <div>
                        <label className="text-gray-400">Price</label>
                        <input type="text" value={booking.price} className="modal-input" disabled />
                    </div>
                    <div className="col-span-1">
                        <label className="text-gray-400">Additional Requests</label>
                        <input 
                            type="text" 
                            name="additionalrequest" 
                            value={formData.additionalrequest} 
                            onChange={handleChange} 
                            className="modal-input" 
                        />
                    </div>

                    <button type="submit" className="modal-button-green col-span-3 mt-4">
                        Save Modification
                    </button>
                    <button type="button" className="modal-button col-span-3 mt-4" onClick={onClose}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default BookingModifyModal;