import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import {
  getConversations,
  getMessages,
} from '../services/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  const fetchConversations = async () => {
    if (!user || authLoading || !localStorage.getItem('accessToken')) {
      setConversations([]);
      return;
    }

    try {
      const response = await getConversations();
      setConversations(response?.data?.conversations || []);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch conversations:', error);
      }
      setConversations([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!user || authLoading || !conversationId) return null;

    setLoading(true);

    try {
      const response = await getMessages(conversationId);
      setMessages(response?.data?.messages || []);
      return response?.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch messages:', error);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (conversationId, content, type = 'text', fileUrl = '', fileName = '', fileSize = 0) => {
    if (!socket || !conversationId || (!content?.trim() && !fileUrl)) return;
    socket.emit('send-message', {
      conversationId,
      content: content?.trim() || '',
      type,
      fileUrl,
      fileName,
      fileSize,
    });
  };

  const markRead = (conversationId) => {
    if (!socket || !conversationId) return;
    socket.emit('mark-read', { conversationId });
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchConversations();
    } else if (!authLoading && !user) {
      setConversations([]);
      setMessages([]);
      setCurrentConversation(null);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      fetchConversations();
    };

    const handleTyping = ({ userId, conversationId }) => {
      setTypingUsers((prev) => ({ ...prev, [conversationId]: userId }));
    };

    const handleStoppedTyping = ({ userId, conversationId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (next[conversationId] === userId) {
          delete next[conversationId];
        }
        return next;
      });
    };

    const handleMessagesRead = ({ conversationId, userId }) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (
            message.conversationId === conversationId &&
            !message.readBy?.includes(userId)
          ) {
            return {
              ...message,
              readBy: [...(message.readBy || []), userId],
            };
          }
          return message;
        })
      );
      fetchConversations();
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-typing', handleTyping);
    socket.on('user-stopped-typing', handleStoppedTyping);
    socket.on('messages-read', handleMessagesRead);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-typing', handleTyping);
      socket.off('user-stopped-typing', handleStoppedTyping);
      socket.off('messages-read', handleMessagesRead);
    };
  }, [socket]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        setCurrentConversation,
        messages,
        setMessages,
        loading,
        fetchConversations,
        fetchMessages,
        sendMessage,
        markRead,
        typingUsers,
        onlineUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used inside ChatProvider');
  }

  return context;
};