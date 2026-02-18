import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useBookingDetailsLogic } from './BookingDetailsModalLogic';
import ConfirmationModal from '../common/ConfirmationModal';
import AnimatedToast from '../common/AnimatedToast';
import CancellationModal from '../common/CancellationModal';
import FinishModal from '../common/FinishModal';
import PriceModal from '../common/PriceModal'; // Import PriceModal
import { ChevronDown, ChevronUp } from 'lucide-react'; // Assuming lucide-react is available
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



const BookingDetailsModal = ({ booking, isOpen, onClose, onStatusUpdate }) => {
    const [currentBooking, setCurrentBooking] = useState(booking);
    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState('');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isCancellationModalOpen, setCancellationModalOpen] = useState(false);
    const [isPriceModalOpen, setPriceModalOpen] = useState(false);
    const [isFinishModalOpen, setFinishModalOpen] = useState(false); // State for FinishModal
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const backupReceiptUrl = "/ReceiptMissing.jpg";

    

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
    };

    useEffect(() => {
        if (isOpen && booking) {
            setCurrentBooking(booking);
        }
    }, [booking, isOpen]);

    const handleToastClose = () => {
        setToast({ ...toast, show: false });
    };

    const fetchUpdatedBookingDetails = async () => {
        if (!currentBooking?.booking_id) return;
    
        try {
            const response = await fetch(`${apiUrl}/api/admin/bookings/details/${currentBooking.booking_id}?role=${encodeURIComponent(role)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const updatedBookingData = await response.json();
            setCurrentBooking(updatedBookingData);
        } catch (error) {
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            return '';
        }
    };

    const { 
        handleCancelled, 
        handlePending, 
        handleConfirmed, 
        handleFinished,
        loading, 
        isConfirmationModalOpen, 
        confirmAction, // Use this for handling confirmation actions
        cancelFinish, 
        actionMessages,
        actionType
    } = useBookingDetailsLogic(
        apiUrl, 
        currentBooking?.booking_id,
        currentBooking?.user_id,
        currentBooking?.email,
        currentBooking,
        () => {
            onStatusUpdate();
            fetchUpdatedBookingDetails();
            setIsStatusDropdownOpen(false);
        }, 
        showToast
    );

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/bookings/cars?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCars(data);
            } catch (error) {
            }
        };

        fetchCars();
    }, []);

    useEffect(() => {
        if (currentBooking) {
            setSelectedCarId(currentBooking.car_id);
            fetchReceipt(currentBooking.booking_id);
        }
    }, [currentBooking]);

    const fetchReceipt = async (booking_id) => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/bookings/receipt-retrieve/${booking_id}?role=${encodeURIComponent(role)}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setReceiptUrl(url);
            } else {
                setReceiptUrl(backupReceiptUrl);
            }
        } catch (error) {
            setReceiptUrl(backupReceiptUrl);
        }
    };

    const handleViewReceipt = () => {
        if (!receiptUrl) {
            setReceiptUrl(backupReceiptUrl);
        }
        setShowReceipt(true);
    };

    const handleClose = async () => {
        onClose();
        setToast({ show: false, message: '', type: 'success' });
    };

    const openCancellationModal = () => {
        setCancellationModalOpen(true);
        setIsStatusDropdownOpen(false);
    };

    const handleCancellationConfirm = async (reason) => {
        handleCancelled(reason); 
        setCancellationModalOpen(false);
    };

    const handleStatusChange = (action) => {
        setIsStatusDropdownOpen(false);
        switch(action) {
            case 'cancelled':
                openCancellationModal();
                break;
            case 'pending':
                handlePending();
                break;
            case 'confirmed':
                handleConfirmed();
                break;
            case 'finished':
                setFinishModalOpen(true); // Open FinishModal
                break;
            default:
                break;
        }
    };

    const openPriceModal = () => {
        setPriceModalOpen(true);
        setIsStatusDropdownOpen(false);
    };

    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`; // Return in dd/mm/yyyy format
    };
    
    

    const handlePriceConfirm = async (price) => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/bookings/notify-price`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    booking_id: currentBooking.booking_id,
                    user_id: currentBooking.user_id,
                    clientEmail: currentBooking.email,
                    price: price,
                    admin_id: adminInfo.admin_id,
                    admin_name: adminInfo.admin_name,
                    admin_role: adminInfo.admin_role,
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to notify price');
            }

            showToast('Price notified successfully.', 'success');
            await fetchUpdatedBookingDetails(); 
            setPriceModalOpen(false);

        } catch (error) {
            showToast('Failed to notify price.', 'error');
        }
    };

    if (!isOpen || !currentBooking) return null;

    return createPortal(
        <>
            <div className="modal">
                <div className="modal-content w-700 h-700 overflow-auto">
                    <h2 className="modal-title text-lg font-semibold mb-4">Booking Details</h2>
                    <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-gray-400">Booking ID</label>
                            <input type="text" value={currentBooking.booking_id} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">User ID</label>
                            <input type="text" value={currentBooking.user_id} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">Car</label>
                            <select
                                className="modal-input"
                                value={selectedCarId}
                                onChange={(e) => setSelectedCarId(e.target.value)}
                                disabled>
                                {cars.map(car => (
                                    <option key={car.id} value={car.id}>
                                        {car.model} {car.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-gray-400">Name</label>
                            <input type="text" defaultValue={currentBooking.name} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">E-Mail</label>
                            <input type="email" defaultValue={currentBooking.email} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">Phone</label>
                            <input type="text" defaultValue={currentBooking.phone} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">Price</label>
                            <input type="number" defaultValue={currentBooking.price} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">Price Accepted</label>
                            <input type="text" value={currentBooking.priceaccepted ? "Yes" : "No"} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">Status</label>
                            <select
                                className="modal-input"
                                value={currentBooking.status}
                                onChange={(e) => { 
                                    // Update the status in the current booking
                                    setCurrentBooking({ ...currentBooking, status: e.target.value });
                                }}
                            >
                                {["Pending", "Confirmed", "Cancelled", "Finished"].map(status => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-gray-400">Pickup Location</label>
                            <input type="text" defaultValue={currentBooking.pickup_location} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">Pickup Date</label>
                            <input 
                                type="date" 
                                value={formatDateForInput(currentBooking.pickup_date)}
                                className="modal-input" 
                                disabled 
                            />
                        </div>
                        <div>
                            <label className="text-gray-400">Pickup Time</label>
                            <input type="time" defaultValue={currentBooking.pickup_time} className="modal-input" disabled />
                        </div>
                        
                        <div>
                            <label className="text-gray-400">Return Location</label>
                            <input type="text" defaultValue={currentBooking.return_location} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">Return Date</label>
                            <input 
                                type="date" 
                                value={formatDateForInput(currentBooking.return_date)}
                                className="modal-input" 
                                disabled 
                            />
                        </div>
                        <div>
                            <label className="text-gray-400">Return Time</label>
                            <input type="time" defaultValue={currentBooking.return_time} className="modal-input" disabled />
                        </div>
                        <div>
                            <label className="text-gray-400">Rental Type</label>
                            <select
                                className="modal-input"
                                value={currentBooking.rental_type}
                                onChange={(e) => { /* Handle rental type change if needed */ }}
                                disabled>
                                {[
                                    { label: "For Personal", value: "personal" },
                                    { label: "For Company", value: "company" }
                                ].map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="text-gray-400">Additional Requests</label>
                            <input type="text" defaultValue={currentBooking.additionalrequest} className="modal-input" disabled />
                        </div>
                        <div>
        <label className="text-gray-400">Creation Date</label>
        <input 
            type="date" 
            value={currentBooking.created_at.split('T')[0]} // Format for input use
            className="modal-input" 
            disabled 
        />

    </div>

                        {/* Conditional rendering for cancellation fields */}
                        {currentBooking.status === 'Cancelled' && (
                            <>
                                <div className="col-span-1">
                                    <label className="text-gray-400">Cancellation Reason</label>
                                    <input 
                                        type="text" 
                                        value={currentBooking.cancel_reason || ''} 
                                        className="modal-input" 
                                        disabled 
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-gray-400">Cancellation Fee</label>
                                    <input 
                                        type="number" 
                                        value={currentBooking.cancel_fee || 0} 
                                        className="modal-input" 
                                        disabled
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-gray-400">Cancellation Date</label>
                                    <input 
                                        type="date" 
                                        value={formatDateForInput(currentBooking.cancel_date)}
                                        className="modal-input" 
                                        disabled 
                                    />
                                </div>
                            </>
                        )}
                        {/* Conditional rendering for cancellation fields */}
                        {currentBooking.status === 'Finished' && (
                            <>
                                <div className="col-span-3">
                                    <label className="text-gray-400">Expenses</label>
                                    <input 
                                        type="number" 
                                        value={currentBooking.expenses || '0'} 
                                        className="modal-input" 
                                        disabled 
                                    />
                                </div>
                                
                            </>
                        )}
                    </form>

                    {/* Status Change Dropdown */}
                    <div className="mt-4 relative">
                        <button 
                            type="button" 
                            className="modal-button w-full flex items-center justify-center"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            disabled={loading}
                        >
                            Change Booking Status 
                            {isStatusDropdownOpen ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
                        </button>
                        
                        {isStatusDropdownOpen && (
                            <div className="absolute z-500 w-full mb-2 bg-white border rounded shadow-lg" style={{ bottom: '100%' }}>
                                <button 
                                    type="button" 
                                    className="bg-red-500 w-full p-2 text-left hover:bg-gray-100 border-b"
                                    onClick={() => handleStatusChange('cancelled')}
                                    disabled={loading}
                                >
                                    Change Status to Cancelled
                                </button>
                                <button 
                                    type="button" 
                                    className="bg-orange-500 w-full p-2 text-left hover:bg-gray-100 border-b"
                                    onClick={() => handleStatusChange('pending')}
                                    disabled={loading}
                                >
                                    Change Status to Pending
                                </button>
                                <button 
                                    type="button" 
                                    className="bg-blue-500 w-full p-2 text-left hover:bg-gray-100 border-b"
                                    onClick={() => handleStatusChange('confirmed')}
                                    disabled={loading}
                                >
                                    Change Status to Confirmed
                                </button>
                                <button 
                                    type="button" 
                                    className="bg-green-500 w-full p-2 text-left hover:bg-gray-100"
                                    onClick={() => handleStatusChange('finished')}
                                    disabled={loading}
                                >
                                    Change Status to Finished
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Button Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-1">
                        <button 
                            type="button" 
                            className="modal-button w-full" 
                            onClick={handleViewReceipt}
                        >
                            View Proof of Payment
                        </button>
                        <button 
                            type="button" 
                            className="modal-button w-full" 
                            onClick={openPriceModal} // Open PriceModal
                            disabled = {currentBooking.price !=0}
                        >
                            Notify Price
                        </button>
                    </div>
                    
                    <button 
                        type="button" 
                        className="modal-button w-full" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Close
                    </button>

                    {/* Price Modal */}
                    <PriceModal
                        isOpen={isPriceModalOpen}
                        onConfirm={handlePriceConfirm}
                        onCancel={() => setPriceModalOpen(false)}
                        updatePrice={onStatusUpdate}
                        booking={currentBooking}
                    />
                    {/* Finish Modal */}
                    <FinishModal
                        isOpen={isFinishModalOpen}
                        onConfirm={handleFinished} // Pass the updated handleFinished function
                        onCancel={() => {
                            setFinishModalOpen(false); // Close the modal
                            // Optionally, reset any other states related to the FinishModal here if needed
                        }}
                    />

                    {/* Receipt Modal */}
                    {showReceipt && (
                        <div className="modal">
                            <div className="modal-content flex flex-col items-center justify-between max-w-[650px] max-h-[800px] w-[700px] h-[800px] overflow-hidden p-4">
                                <div className="flex-grow flex items-center justify-center mb-4">
                                    <img 
                                        src={receiptUrl} 
                                        alt={receiptUrl === backupReceiptUrl ? "No Receipt Available" : "Receipt"}
                                        className="max-w-full max-h-[500px] object-contain rounded-lg"
                                        onError={(e) => {
                                            e.target.src = backupReceiptUrl;
                                            e.target.alt = "No Receipt Available";
                                        }}
                                    />
                                </div>
                                <button 
                                    className="modal-button w-full"
                                    onClick={() => setShowReceipt(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Modal */}
                    <ConfirmationModal
                        isOpen={isConfirmationModalOpen}
                        onConfirm={confirmAction} // Handle confirmation
                        onCancel={cancelFinish}
                        message={actionMessages[actionType]} 
                    />

                    {/* Cancellation Modal */}
                    <CancellationModal
                        isOpen={isCancellationModalOpen}
                        onConfirm={handleCancellationConfirm}
                        onCancel={() => setCancellationModalOpen(false)}
                    />
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <AnimatedToast
                    message={toast.message}
                    type={toast.type}
                    onClose={handleToastClose}
                />
            )}
        </>,
        document.body
    );
};

export default BookingDetailsModal;
