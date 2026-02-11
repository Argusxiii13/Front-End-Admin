import React, { useEffect, useRef, useState } from 'react';
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

const VehicleAddModal = ({ onClose, onAddSuccess }) => {
    const [imageSrc, setImageSrc] = useState('');
    const [imageError, setImageError] = useState(false);
    const [features, setFeatures] = useState(['']); // Initialize with one empty field
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({}); // State for error messages
    const fileInputRef = useRef(null);

    // States for dropdown options
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [transmissions, setTransmissions] = useState([]);
    const [types, setTypes] = useState([]);

    // States for dynamic inputs
    const [brandInput, setBrandInput] = useState('');
    const [modelInput, setModelInput] = useState('');
    const [typeInput, setTypeInput] = useState('');
    const [transmissionInput, setTransmissionInput] = useState('');
    const [driverInput, setDriverInput] = useState(''); // New state for driver input
    const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/admin/fleet/dropdowns-value?role=${encodeURIComponent(role)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch dropdown data');
                }
                const data = await response.json();

                setBrands(data.brands);
                setModels(data.models);
                setTransmissions(data.transmissions);
                setTypes(data.types);
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchDropdownData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'brandInput') {
            setBrandInput(value);
        } else if (name === 'modelInput') {
            setModelInput(value);
        } else if (name === 'typeInput') {
            setTypeInput(value);
        } else if (name === 'transmissionInput') {
            setTransmissionInput(value);
        } else if (name === 'driverInput') { // Handle driver input change
            setDriverInput(value);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error for the input being changed
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelect = (inputSetter, value, dropdownName) => {
        inputSetter(value);
        setOpenDropdown(null); // Close the dropdown after selection
    };

    const handleDropdownFocus = (dropdownName) => {
        setOpenDropdown(dropdownName); // Open the selected dropdown
    };

    const validateFields = () => {
        const newErrors = {};
        if (!brandInput) newErrors.brandInput = 'Brand is required';
        if (!modelInput) newErrors.modelInput = 'Model is required';
        if (!typeInput) newErrors.typeInput = 'Type is required';
        if (!transmissionInput) newErrors.transmissionInput = 'Transmission is required';
        if (!formData.plate_num) newErrors.plate_num = 'Plate Number is required';
        if (!formData.price) newErrors.price = 'Price is required';
        if (!formData.capacity) newErrors.capacity = 'Capacity is required';
        if (!formData.luggage) newErrors.luggage = 'Luggage is required';
        if (!formData.doors) newErrors.doors = 'Doors are required';
        if (!driverInput) newErrors.driverInput = 'Driver is required';
        if (features.some(feature => !feature)) newErrors.features = 'All features must be filled';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateFields()) return; // Stop if validation fails

        try {
            setIsSaving(true);
            const featuresString = JSON.stringify(features);
            let imageData = null;
            if (imageSrc && imageSrc.startsWith('data:')) {
                imageData = imageSrc.split(',')[1];
            }

            const response = await fetch(`${apiUrl}/api/admin/fleet/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    brand: brandInput,
                    model: modelInput,
                    type: typeInput,
                    transmission: transmissionInput,
                    driver: driverInput, // Include driver in the request body
                    features: featuresString,
                    image: imageData,
                    admin_id: adminInfo.admin_id,
                    admin_name: adminInfo.admin_name,
                    admin_role: adminInfo.admin_role
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add vehicle');
            }

            // Clear all input fields and features
            setImageSrc('');
            setImageError(false);
            setFeatures(['']); // Reset to one empty field
            setFormData({});
            setBrandInput('');
            setModelInput('');
            setTypeInput('');
            setTransmissionInput('');
            setDriverInput(''); // Reset driver input
            setErrors({}); // Clear errors
            
            // Optionally, call onAddSuccess
            if (onAddSuccess) {
                onAddSuccess();
            }
        } catch (error) {
            console.error('Error adding vehicle details:', error);
        } finally {
            setIsSaving(false);
        }
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

    const handleClickOutside = (event) => {
        if (!event.target.closest('.dropdown')) {
            setOpenDropdown(null); // Close all dropdowns when clicking outside
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return createPortal(
        <div className="modal">
            <div className="modal-content w-700 h-auto overflow-auto">
                <div className="modal-header">
                    <span className="modal-title">Add New Vehicle</span>
                </div>

                {/* Image Section */}
                <div className="flex justify-center mb-4 relative">
                    <div className="relative w-32">
                        <div 
                            className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 transition-all duration-300 transform group-hover:scale-105 group-hover:border-blue-400 cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
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
                    </div>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Input Fields Section */}
                <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="mb-4 relative dropdown">
                        <label className="block text-gray-400">Brand</label>
                        <input
                            type="text"
                            name="brandInput"
                            value={brandInput}
                            onChange={handleInputChange}
                            onFocus={() => handleDropdownFocus('brand')}
                            className="modal-input"
                            placeholder="Enter or select a brand"
                        />
                        {errors.brandInput && <span className="text-red-500">{errors.brandInput}</span>}
                        {openDropdown === 'brand' && (
                            <div className="absolute bg-white border rounded shadow-lg mt-1 z-10" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {brands.map((brand) => (
                                    <div
                                        key={brand.text}
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleSelect(setBrandInput, brand.text, 'brand')}
                                    >
                                        {brand.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mb-4 relative dropdown">
                        <label className="block text-gray-400">Model</label>
                        <input
                            type="text"
                            name="modelInput"
                            value={modelInput}
                            onChange={handleInputChange}
                            onFocus={() => handleDropdownFocus('model')}
                            className="modal-input"
                            placeholder="Enter or select a model"
                        />
                        {errors.modelInput && <span className="text-red-500">{errors.modelInput}</span>}
                        {openDropdown === 'model' && (
                            <div className="absolute bg-white border rounded shadow-lg mt-1 z-10" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {models.map((model) => (
                                    <div
                                        key={model.text}
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleSelect(setModelInput, model.text, 'model')}
                                    >
                                        {model.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mb-4 relative dropdown">
                        <label className="block text-gray-400">Type</label>
                        <input
                            type="text"
                            name="typeInput"
                            value={typeInput}
                            onChange={handleInputChange}
                            onFocus={() => handleDropdownFocus('type')}
                            className="modal-input"
                            placeholder="Enter or select a type"
                        />
                        {errors.typeInput && <span className="text-red-500">{errors.typeInput}</span>}
                        {openDropdown === 'type' && (
                            <div className="absolute bg-white border rounded shadow-lg mt-1 z-10" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {types.map((type) => (
                                    <div
                                        key={type.text}
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleSelect(setTypeInput, type.text, 'type')}
                                    >
                                        {type.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mb-4 relative dropdown">
                        <label className="block text-gray-400">Transmission</label>
                        <input
                            type="text"
                            name="transmissionInput"
                            value={transmissionInput}
                            onChange={handleInputChange}
                            onFocus={() => handleDropdownFocus('transmission')}
                            className="modal-input"
                            placeholder="Enter or select a transmission"
                        />
                        {errors.transmissionInput && <span className="text-red-500">{errors.transmissionInput}</span>}
                        {openDropdown === 'transmission' && (
                            <div className="absolute bg-white border rounded shadow-lg mt-1 z-10" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {transmissions.map((transmission) => (
                                    <div
                                        key={transmission.text}
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleSelect(setTransmissionInput, transmission.text, 'transmission')}
                                    >
                                        {transmission.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400">Plate Number</label>
                        <input
                            type="text"
                            name="plate_num"
                            value={formData.plate_num || ''}
                            onChange={handleInputChange}
                            className="modal-input"
                            placeholder="ABC-1234"
                        />
                        {errors.plate_num && <span className="text-red-500">{errors.plate_num}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400">Price</label>
                        <input
                            type="text"
                            name="price"
                            value={formData.price || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    handleInputChange(e);
                                }
                            }}
                            className="modal-input"
                            placeholder="5000.00"
                        />
                        {errors.price && <span className="text-red-500">{errors.price}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400">Capacity</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity || ''}
                            onChange={handleInputChange}
                            className="modal-input"
                            min="0" // Prevent negative numbers
                            placeholder="10"
                        />
                        {errors.capacity && <span className="text-red-500">{errors.capacity}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400">Luggage</label>
                        <input
                            type="number"
                            name="luggage"
                            value={formData.luggage || ''}
                            onChange={handleInputChange}
                            className="modal-input"
                            min="0" // Prevent negative numbers
                            placeholder="10"
                        />
                        {errors.luggage && <span className="text-red-500">{errors.luggage}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400">Doors</label>
                        <input
                            type="number"
                            name="doors"
                            value={formData.doors || ''}
                            onChange={handleInputChange}
                            className="modal-input"
                            min="0" // Prevent negative numbers
                            placeholder="6"
                        />
                        {errors.doors && <span className="text-red-500">{errors.doors}</span>}
                    </div>

                    {/* Driver Input Field */}
                    <div className="mb-4">
                        <label className="block text-gray-400">Driver</label>
                        <input
                            type="text"
                            name="driverInput"
                            value={driverInput}
                            onChange={handleInputChange}
                            className="modal-input"
                            placeholder="Enter driver's name"
                        />
                        {errors.driverInput && <span className="text-red-500">{errors.driverInput}</span>}
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
                                        className="modal-input flex-1"
                                        placeholder="Insert Feature Here"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFeature(index)}
                                        className="ml-2 text-red-500"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                        {errors.features && <span className="text-red-500">{errors.features}</span>}
                        <button
                            type="button"
                            onClick={handleAddFeature}
                            className="modal-button w-full mt-2"
                        >
                            Add Field
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400">Description</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleInputChange}
                            className="modal-input h-20"
                            placeholder="What a beautiful car"
                        />
                    </div>
                </form>

                {/* Action Buttons */}
                <div className="mt-4">
                    <button 
                        onClick={handleSave} 
                        className="modal-button w-full mb-2"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Add Vehicle'}
                    </button>
                    <button onClick={onClose} className="modal-button w-full">
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default VehicleAddModal;