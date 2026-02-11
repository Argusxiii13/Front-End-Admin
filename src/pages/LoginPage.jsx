import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_API_URL;

const OTPLoginPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [otpSendStatus, setOtpSendStatus] = useState({
    sending: false,
    canSend: true,
    cooldownRemaining: 0
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (otpSendStatus.cooldownRemaining > 0) {
      timer = setInterval(() => {
        setOtpSendStatus(prev => ({
          ...prev,
          cooldownRemaining: prev.cooldownRemaining - 1,
          canSend: prev.cooldownRemaining - 1 === 0
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSendStatus.cooldownRemaining]);

  const handleSendOTP = async () => {

    setError('');
    
    if (!otpSendStatus.canSend) return;


    setOtpSendStatus(prev => ({ ...prev, sending: true, canSend: false }));

    try {

      const response = await axios.post(`${apiUrl}/api/admin/login-otp`, { email });
      

      setOtpSendStatus({
        sending: false,
        canSend: false,
        cooldownRemaining: 120
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      setOtpSendStatus(prev => ({ ...prev, sending: false, canSend: true }));
      console.error('OTP send error:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/admin/verify-login-otp`, { 
        email, 
        otp 
      });

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(response.data.user));
      
      navigate('/overview');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      console.error('Login error:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">OTP Login</h2>
        
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-gray-300">Email Address</label>
            <div className="flex">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow p-2 bg-gray-700 text-white rounded-l focus:outline-none focus:ring focus:ring-blue-600"
                required
                autoComplete="email"
                disabled={loginLoading}
              />
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={!otpSendStatus.canSend || otpSendStatus.sending || loginLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r 
                           disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                {otpSendStatus.sending ? 'Sending...' : 
                 otpSendStatus.cooldownRemaining > 0 ? 
                 `Resend (${otpSendStatus.cooldownRemaining}s)` : 
                 'Send OTP'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="otp" className="block mb-2 text-gray-300">OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring focus:ring-blue-600"
              required
              disabled={!otpSendStatus.cooldownRemaining || loginLoading}
              maxLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading || !otpSendStatus.cooldownRemaining}
            className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-bold text-white 
                       transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginLoading ? 'Verifying...' : 'Attempt Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPLoginPage;