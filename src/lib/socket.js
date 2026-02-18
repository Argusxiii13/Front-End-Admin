import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => {
  if (socketInstance) return socketInstance;

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5174';
  
  socketInstance = io(baseUrl, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: false,
    timeout: 10000,
  });

  socketInstance.on('connect_error', () => {
    socketInstance.disconnect();
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
};
