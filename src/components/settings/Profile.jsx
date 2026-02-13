import { User } from "lucide-react";
import SettingSection from "./SettingSection";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const getAdminInfo = () => {
    try {
        const storedAdminInfo = localStorage.getItem('adminInfo');
        return storedAdminInfo ? JSON.parse(storedAdminInfo) : null;
    } catch (error) {
        return null;
    }
};

const adminInfo = getAdminInfo() || {};

const Profile = () => {
    const navigate = useNavigate(); // Initialize the navigation hook

    const handleLogout = () => {
        localStorage.removeItem('authToken'); // Clear the token
        localStorage.removeItem('adminInfo'); // Clear the admin info
        localStorage.removeItem('demoMode'); // Clear demo mode state
        navigate('/login'); // Redirect to login page
    };

    return (
        <SettingSection icon={User} title={"Profile"}>
            <div className='flex flex-col sm:flex-row items-center mb-6'>
                <img
                    src='admin_icon.jpg'
                    alt='Profile'
                    className='rounded-full w-20 h-20 object-cover mr-4'
                />
                <div>
                    <h3 className='text-lg font-semibold text-gray-100'>{adminInfo ? adminInfo.admin_name : 'User Name'}</h3>
                    <p className='text-gray-400'>{adminInfo ? adminInfo.email : 'Email not available'}</p>
                </div>
            </div>

            <div className='flex space-x-4'>
                <button 
                    onClick={handleLogout} 
                    className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto'
                >
                    Logout
                </button>
            </div>
        </SettingSection>
    );
};

export default Profile;
