import React, { useEffect, useState } from 'react';
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
const role = adminInfo.admin_role || 'RAR'; // Provide a default value if role is not found
const UserDetailsModal = ({ user, onClose }) => {
    const [imageSrc, setImageSrc] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        // Reset image states when user changes
        setImageSrc('');
        setImageError(false);
    
        if (user) {
            const fetchImage = async () => {
    
                try {
                    const response = await fetch(`${apiUrl}/api/admin/users/image/${user.id}?role=${encodeURIComponent(role)}`);
                    if (!response.ok) {
                        setImageError(true);
                        return;
                    }
    
                    const blob = await response.blob();
                    const imageObjectURL = URL.createObjectURL(blob);
                    setImageSrc(imageObjectURL);
                } catch (error) {
                    setImageError(true);
                }
            };
    
            fetchImage();
    
            // Cleanup function to revoke object URL
            return () => {
                if (imageSrc) {
                    URL.revokeObjectURL(imageSrc);
                }
            };
        }
    }, [user, imageSrc]); // Add imageSrc to the dependency array

    if (!user) return null;

    return createPortal(
        <div className='modal'>
            <div className='modal-content-small'>
                <div className='modal-header'>
                    <span className='modal-title'>User Information</span>
                    
                </div>
                <div className='mt-4'>
                    {imageError ? (
                        <div className='w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center text-gray-500'>
                            No Image
                        </div>
                    ) : imageSrc ? (
                        <img
                            src={imageSrc}
                            alt='User Profile'
                            className='w-24 h-24 rounded-full mx-auto mb-4'
                        />
                    ) : (
                        <div className='w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 animate-pulse'></div>
                    )}
                    <div className='mb-4'>
                        <label className='block text-gray-400'>Name</label>
                        <input
                            type='text'
                            value={user.name}
                            disabled
                            className='modal-input'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-400'>Email</label>
                        <input
                            type='text'
                            value={user.email}
                            disabled
                            className='modal-input'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-400'>Phone Number</label>
                        <input
                            type='text'
                            value={user.phonenumber}
                            disabled
                            className='modal-input'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-400'>Gender</label>
                        <input
                            type='text'
                            value={user.gender}
                            disabled
                            className='modal-input'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-400'>Created At</label>
                        <input
                            type='text'
                            value={new Date(user.created_at).toLocaleDateString()}
                            disabled
                            className='modal-input'
                        />
                    </div>
                </div>
                <button onClick={onClose} className='modal-button w-full'>Close</button>
            </div>
        </div>,
        document.body
    );
};

export default UserDetailsModal;
