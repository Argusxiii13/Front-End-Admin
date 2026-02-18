import { useState, useEffect } from 'react';
const getAdminInfo = () => {
    try {
        const storedAdminInfo = localStorage.getItem('adminInfo');
        return storedAdminInfo ? JSON.parse(storedAdminInfo) : null;
    } catch (error) {
        return null;
    }
};

// Get the role from adminInfo
const adminInfo = getAdminInfo() || {};
const role = adminInfo.admin_role || 'RAR';


export const useBookingDetailsLogic = (apiUrl, bookingId, user_id, email, booking, onStatusUpdate, showToast) => {
    const [loading, setLoading] = useState(false);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [carInfo, setCarInfo] = useState({});  // New state for car information

    const carDetails = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/admin/sales/car-details?role=${encodeURIComponent(role)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            // Transform the data into a more useful structure
            const carInfoMap = data.reduce((acc, car) => {
                acc[car.id] = {
                    id: car.id,
                    carId: `${car.type} - ${car.plate_num}`,
                    driver: car.driver,
                    brand: car.brand,
                    model: car.model,
                    capacity: car.capacity,
                    luggage: car.luggage,
                    doors: car.doors,
                    transmission: car.transmission,
                    features: car.features,
                    status: car.status,
                    price: car.price,
                    description: car.description
                };
                return acc;
            }, {});
            
            setCarInfo(carInfoMap);
        } catch (error) {
        }
    };
    useEffect(() => {
            carDetails();
        }, []);
    const actionMessages = {
        finish: "Are you sure you want to mark this booking as finished?",
        confirm: "Are you sure you want to confirm this booking?",
        pending: "Are you sure you want to change the status to pending?",
    };

    const handlePending = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/admin/bookings/pending/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...booking, // Spread the booking object here
                    admin_id: adminInfo.admin_id,
                    admin_name: adminInfo.admin_name,
                    admin_role: adminInfo.admin_role,
                    user_id: user_id,
                    clientEmail: email
                })
            });
    
            const data = await response.json();
            if (response.ok) {
                showToast('Booking status updated to pending!', 'success');
                if (typeof onStatusUpdate === 'function') {
                    onStatusUpdate(data);
                }
            } else {
                showToast(data.message || 'Failed to set booking to pending.', 'error');
            }
        } catch (error) {
            showToast('Failed to update status. Please try again.', 'error');
        } finally {
            setLoading(false);
            setConfirmationModalOpen(false);
        }
    };

    const handleFinished = async (totalExpenses) => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/admin/bookings/finish/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    expenses: parseFloat(totalExpenses),
                    admin_id: adminInfo.admin_id,
                    admin_name: adminInfo.admin_name,
                    admin_role: adminInfo.admin_role,
                    user_id: user_id,
                    clientEmail: email
                }), 
            });
    
            const data = await response.json();
            if (response.ok) {
                showToast('Booking marked as finished!', 'success');
                if (typeof onStatusUpdate === 'function') {
                    onStatusUpdate(data);
                }
            } else {
                showToast(data.message || 'Failed to finish booking.', 'error');
            }
        } catch (error) {
            showToast('Failed to update status. Please try again.', 'error');
        } finally {
            setLoading(false);
            // Reset finish modal state if necessary
        }
    };

    const handleConfirmed = async () => {
        setLoading(true);
        try {
            // Prepare the invoice data from the booking object
            const invoiceData = {
                bookingId: booking.booking_id,
                officer: booking.officer,
                createdAt: booking.created_at,
                pickupDate: booking.pickup_date,
                returnDate: booking.return_date,
                rentalType: booking.rental_type,
                name: booking.name,
                price: booking.price,
                role: adminInfo.admin_role,
                carId: booking.car_id,
                driver: booking.additionalrequest,
                clientEmail: booking.email,
                admin_role: adminInfo.admin_role,
                admin_name: adminInfo.admin_name,
                admin_id: adminInfo.admin_id,
                user_id: user_id
            };
    
            // Make a POST request to generate and send the invoice
            const invoiceResponse = await fetch(`${apiUrl}/api/generate-and-send-invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invoiceData),
            });
    
            const invoiceDataResponse = await invoiceResponse.json();
            if (!invoiceResponse.ok) {
                throw new Error(invoiceDataResponse.message || 'Failed to send invoice.');
            }
    
            // Now confirm the booking
            const confirmResponse = await fetch(`${apiUrl}/api/admin/bookings/confirm/${booking.booking_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    admin_id: adminInfo.admin_id,
                    admin_name: adminInfo.admin_name,
                    admin_role: adminInfo.admin_role,
                    user_id: user_id,
                    clientEmail: booking.email // Pass the client's email for notifications
                }),
            });
    
            const confirmData = await confirmResponse.json();
            if (!confirmResponse.ok) {
                throw new Error(confirmData.message || 'Failed to confirm booking.');
            }
    
            showToast('Booking confirmed and invoice sent!', 'success');
            if (typeof onStatusUpdate === 'function') {
                onStatusUpdate({ ...invoiceDataResponse, ...confirmData });
            }
        } catch (error) {
            showToast('Failed to confirm booking and send invoice. Please try again.', 'error');
        } finally {
            setLoading(false);
            setConfirmationModalOpen(false);
        }
    };

    const handleCancelled = async (reason) => {
        setLoading(true);
        try {
            if (!reason) {
                showToast('Cancellation reason is required.', 'error');
                setLoading(false);
                return;
            }

            const response = await fetch(`${apiUrl}/api/admin/bookings/cancel/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    cancel_reason: reason,
                    admin_id: adminInfo.admin_id,
                    admin_name: adminInfo.admin_name,
                    admin_role: adminInfo.admin_role,
                    user_id: user_id,
                    clientEmail: email
                 }),
            });

            const data = await response.json();
            if (response.ok) {
                showToast('Booking cancelled!', 'success');
            
                
            
                // Fetch the updated booking details after canceling
                const updatedResponse = await fetch(`${apiUrl}/api/admin/bookings/details/${bookingId}?role=${encodeURIComponent(role)}`);
                const updatedData = await updatedResponse.json();
            
                if (updatedResponse.ok) {
                    if (typeof onStatusUpdate === 'function') {
                        onStatusUpdate(updatedData);
                    }
                } else {
                }
            } else {
                showToast(data.message || 'Failed to cancel booking.', 'error');
            }
        } catch (error) {
            showToast('Failed to cancel booking. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openConfirmationModal = (type) => {
        setActionType(type);
        setConfirmationModalOpen(true);
    };

    const confirmAction = () => {
        switch (actionType) {
            case 'pending':
                handlePending();
                break;
            case 'confirm':
                handleConfirmed();
                break;
            default:
                break;
        }
    };

    const cancelFinish = () => {
        setConfirmationModalOpen(false);
        setActionType(null);
    };

    return {
        handleFinished, // Directly use FinishModal
        handleConfirmed: () => openConfirmationModal('confirm'), // Use ConfirmationModal
        handlePending: () => openConfirmationModal('pending'), // Use ConfirmationModal
        handleCancelled, // Use CancellationModal
        loading,
        isConfirmationModalOpen,
        confirmAction,
        cancelFinish,
        actionMessages,
        actionType,
    };
};
