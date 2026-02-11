import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const AnimatedToast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`fixed top-4 right-4 left-4 sm:left-auto sm:w-full sm:max-w-sm md:max-w-md flex items-center p-4 mb-4 text-gray-500 bg-white rounded-lg shadow z-[1100] ${
            type === 'success' ? 'border-green-500' : 'border-red-500'
          } border-l-4`}
          role="alert"
        >
          <div className={`inline-flex flex-shrink-0 justify-center items-center w-10 h-10 sm:w-8 sm:h-8 ${
            type === 'success' ? 'text-green-500' : 'text-red-500'
          }`}>
            {type === 'success' ? (
              <CheckCircle className="w-6 h-6 sm:w-5 sm:h-5" />
            ) : (
              <XCircle className="w-6 h-6 sm:w-5 sm:h-5" />
            )}
          </div>
          <div className="ml-3 text-sm sm:text-base font-normal">{message}</div>
          <button
            type="button"
            onClick={handleClose}
            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center"
            aria-label="Close"
          >
            <X className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedToast;