import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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

const VehicleDetailsModal = ({ vehicle, onClose, onUpdateSuccess, refresh }) => {
    const [imageSrc, setImageSrc] = useState('');
    const [imageError, setImageError] = useState(false);
    const [features, setFeatures] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setImageSrc('');
        setImageError(false);
        setFormData(vehicle || {});
    
        if (vehicle) {
            const fetchImage = async () => {
                try {
                    const response = await fetch(`${apiUrl}/api/admin/fleet/vehicle-details/${vehicle.id}?role=${encodeURIComponent(role)}`);
                    if (!response.ok) {
                        setImageError(true);
                        return;
                    }
    
                    const data = await response.json();
                    if (data.image) {
                        setImageSrc(`data:image/svg+xml;base64,${data.image}`);
                    } else {
                        setImageError(true);
                    }
    
                    const parsedFeatures = JSON.parse(data.features || "[]");
                    setFeatures(parsedFeatures);
                } catch (error) {
                    setImageError(true);
                }
            };
    
            fetchImage();
        }
    }, [vehicle]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Handle price input as string until saving
        if (name === 'price') {
            setFormData(prev => ({
                ...prev,
                [name]: value // Keep it as string for now
            }));
            return;
        }
    
        // Convert to integer for numeric fields
        if (['capacity', 'luggage', 'doors'].includes(name)) {
            const processedValue = parseInt(value) || 0;
            setFormData(prev => ({
                ...prev,
                [name]: processedValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value // Other fields
            }));
        }
    };

    const handleModify = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const featuresString = JSON.stringify(features);
            let imageData = null;
            if (imageSrc && imageSrc.startsWith('data:')) {
                imageData = imageSrc.split(',')[1]; // Get base64 part after the comma
            }
            const cleanedVehicleId = parseInt(vehicle.id, 10);
            const response = await fetch(`${apiUrl}/api/admin/fleet/update/${cleanedVehicleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    features: featuresString,
                    image: imageData,
                    admin_id: adminInfo.admin_id, 
                    admin_name: adminInfo.admin_name,
                    admin_role: adminInfo.admin_role,
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to update vehicle');
            }
    
            setIsEditing(false);
            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
        } catch (error) {
        } finally {
            setIsSaving(false);
        }
        refresh(vehicle);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(vehicle);
        setFeatures(JSON.parse(vehicle.features || "[]"));
    };

    const handleAddFeature = () => {
        setFeatures([...features, '']);
    };

    const handleRemoveFeature = (index) => {
        const updatedFeatures = features.filter((_, i) => i !== index);
        setFeatures(updatedFeatures);
    };

    const handleFeatureChange = (index, value) => {
        const updatedFeatures = features.map((feature, i) =>
            i === index ? value : feature
        );
        setFeatures(updatedFeatures);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getUTCFullYear();
        const hours = String(date.getUTCHours()).padStart(2, '0'); // Get hours in UTC
        const minutes = String(date.getUTCMinutes()).padStart(2, '0'); // Get minutes in UTC
        const seconds = String(date.getUTCSeconds()).padStart(2, '0'); // Get seconds in UTC
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    if (!vehicle) return null;

    return createPortal(
        <div className="modal">
            <div className="modal-content w-700 h-auto overflow-auto">
                <div className="modal-header">
                    <span className="modal-title">Vehicle Information</span>
                </div>

                {/* Image Section */}
                <div className="flex justify-center mb-4 relative">
                    <div className="relative w-32">
                        <div 
                            className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 transition-all duration-300 transform group-hover:scale-105 group-hover:border-blue-400 cursor-pointer"
                            onClick={() => isEditing && fileInputRef.current.click()}
                        >
                            {imageSrc ? (
                                <img
                                    src={imageSrc}
                                    alt="Vehicle"
                                    className="object-cover w-full h-full"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    No Image
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <div className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                                <span className="text-white text-sm">✏️</span>
                            </div>
                        )}
                    </div>
                </div>
                <input
                    type="file"
                    accept="image/svg+xml"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Input Fields Section */}
                <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-400">Brand</label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400">Model</label>
                        <input
                            type="text"
                            name="model"
                            value={formData.model || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400">Type</label>
                        <input
                            type="text"
                            name="type"
                            value={formData.type || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400">Transmission</label>
                        <input
                            type="text"
                            name="transmission"
                            value={formData.transmission || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400">Plate Number</label>
                        <input
                            type="text"
                            name="plate_num"
                            value={formData.plate_num || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400">Price</label>
                        <input
                            type="text"
                            name="price"
                            value={formData.price || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty input or valid decimal numbers
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    handleInputChange(e);
                                }
                            }}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400">Capacity</label>
                        <input
                            type="text"
                            name="capacity"
                            value={formData.capacity || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400">Luggage</label>
                        <input
                            type="text"
                            name="luggage"
                            value={formData.luggage || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400">Doors</label>
                        <input
                            type="text"
                            name="doors"
                            value={formData.doors || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    
                    {/* Driver Input Field */}
                    <div className="mb-4">
                        <label className="block text-gray-400">Driver</label>
                        <input
                            type="text"
                            name="driver"
                            value={formData.driver || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>

                    

                    <div className="mb-4">
                        <label className="block text-gray-400">Description</label>
                        <input
                            type = "text"
                            name="description"
                            value={formData.description || 'No description available'}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="modal-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400">Created At</label>
                        <input
                            type="text"
                            value={formatDate(vehicle.created_at)} // Use the formatDate function here
                            disabled
                            className="modal-input"
                        />
                    </div>
                    {/* Features Section */}
                    <div className="mb-4">
                        <label className="block text-gray-400">Features</label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        disabled={!isEditing}
                                        className="modal-input flex-1"
                                    />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(index)}
                                            className="ml-2 text-red-500"
                                        >
                                            X
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleAddFeature}
                                className="modal-button w-full mt-2"
                            >
                                Add Field
                            </button>
                        )}
                    </div>
                </form>


                {/* Action Buttons */}
                <div className="mt-4">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleSave} 
                                className="modal-button w-full mb-2"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                                onClick={handleCancel} 
                                className="modal-button w-full"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={handleModify} className="modal-button w-full mb-2">
                            Modify
                        </button>
                    )}
                </div>

                {/* Close button hidden when editing */}
                {!isEditing && (
                    <button onClick={onClose} className="modal-button w-full">
                        Close
                    </button>
                )}
            </div>
        </div>,
        document.body
    );
};

export default VehicleDetailsModal;
