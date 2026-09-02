import { createContext, useContext, useEffect, useState } from 'react';
import { getMySessions } from '../services/api';
import { useAuth } from './AuthContext';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    if (!user || authLoading || !localStorage.getItem('accessToken')) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getMySessions();
      setSessions(response?.data?.sessions || []);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch sessions:', error);
      }
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchSessions();
    } else if (!authLoading && !user) {
      setSessions([]);
      setLoading(false);
    }
  }, [user, authLoading]);

  return (
    <SessionContext.Provider value={{ sessions, loading, fetchSessions }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSessions must be used within a SessionProvider');
  }

  return context;
};
