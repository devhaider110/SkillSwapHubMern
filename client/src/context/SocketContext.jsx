import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
const SOCKET_URL = 'https://skillswap-backend-8lqp.onrender.com';

export const SocketProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Do not create a socket while auth is still being restored.
    if (authLoading || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setOnlineUsers([]);
      return undefined;
    }

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setSocket(null);
      return undefined;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    newSocket.on('online-users', (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();

      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }

      setSocket(null);
    };
  }, [user, authLoading]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, socketRef }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used inside SocketProvider');
  }

  return context;
};
