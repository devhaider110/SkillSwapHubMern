import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  // ============================================================
  // FETCH CONVERSATIONS
  // ============================================================

  const fetchConversations = useCallback(async () => {
    if (
      !user ||
      authLoading ||
      !localStorage.getItem('accessToken')
    ) {
      setConversations([]);
      return;
    }

    try {
      const response = await getConversations();

      setConversations(
        response?.data?.conversations || []
      );
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error(
          'Failed to fetch conversations:',
          error
        );
      }

      setConversations([]);
    }
  }, [user, authLoading]);

  // ============================================================
  // FETCH MESSAGES
  // ============================================================

  const fetchMessages = useCallback(
    async (conversationId) => {
      if (
        !user ||
        authLoading ||
        !conversationId
      ) {
        return null;
      }

      setLoading(true);

      try {
        const response = await getMessages(
          conversationId
        );

        const fetchedMessages =
          response?.data?.messages || [];

        setMessages(fetchedMessages);

        return response?.data;
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error(
            'Failed to fetch messages:',
            error
          );
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, authLoading]
  );

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = useCallback(
    (
      conversationId,
      content = '',
      type = 'text',
      fileUrl = '',
      fileName = '',
      fileSize = 0,
      mimeType = ''
    ) => {
      if (!socket || !conversationId) {
        return false;
      }

      const cleanContent =
        typeof content === 'string'
          ? content.trim()
          : '';

      if (
        type === 'text' &&
        !cleanContent
      ) {
        return false;
      }

      if (
        type !== 'text' &&
        !fileUrl
      ) {
        return false;
      }

      socket.emit('send-message', {
        conversationId,
        content: cleanContent,
        type,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
      });

      return true;
    },
    [socket]
  );

  // ============================================================
  // MARK AS READ
  // ============================================================

  const markRead = useCallback(
    (conversationId) => {
      if (!socket || !conversationId) {
        return;
      }

      socket.emit('mark-read', {
        conversationId,
      });
    },
    [socket]
  );

  // ============================================================
  // START / JOIN CONVERSATION
  // ============================================================

  useEffect(() => {
    if (!socket || !currentConversation?._id) {
      return;
    }

    socket.emit(
      'join-conversation',
      currentConversation._id
    );

    return () => {
      socket.emit(
        'leave-conversation',
        currentConversation._id
      );
    };
  }, [socket, currentConversation?._id]);

  // ============================================================
  // AUTH → FETCH CONVERSATIONS
  // ============================================================

  useEffect(() => {
    if (!authLoading && user) {
      fetchConversations();
    }

    if (!authLoading && !user) {
      setConversations([]);
      setMessages([]);
      setCurrentConversation(null);
      setTypingUsers({});
    }
  }, [
    user,
    authLoading,
    fetchConversations,
  ]);

  // ============================================================
  // SOCKET LISTENERS
  // ============================================================

  useEffect(() => {
    if (!socket || !user) {
      return undefined;
    }

    // ----------------------------------------------------------
    // RECEIVE MESSAGE
    // ----------------------------------------------------------

    const handleReceiveMessage = (message) => {
      if (!message?.conversationId) {
        return;
      }

      const conversationId =
        message.conversationId.toString();

      const currentId =
        currentConversation?._id?.toString();

      // Only append if current conversation is open
      if (currentId === conversationId) {
        setMessages((prev) => {
          // Prevent duplicate messages
          if (
            message._id &&
            prev.some(
              (item) =>
                item._id?.toString() ===
                message._id.toString()
            )
          ) {
            return prev;
          }

          return [...prev, message];
        });

        // Automatically mark current conversation read
        if (
          message.sender?._id?.toString() !==
          user._id?.toString()
        ) {
          socket.emit('mark-read', {
            conversationId,
          });
        }
      }

      fetchConversations();
    };

    // ----------------------------------------------------------
    // TYPING
    // ----------------------------------------------------------

    const handleTyping = ({
      userId,
      conversationId,
    }) => {
      if (
        userId?.toString() ===
        user._id?.toString()
      ) {
        return;
      }

      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: userId,
      }));
    };

    // ----------------------------------------------------------
    // STOP TYPING
    // ----------------------------------------------------------

    const handleStoppedTyping = ({
      userId,
      conversationId,
    }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };

        if (
          next[conversationId]?.toString() ===
          userId?.toString()
        ) {
          delete next[conversationId];
        }

        return next;
      });
    };

    // ----------------------------------------------------------
    // MESSAGES READ
    // ----------------------------------------------------------

    const handleMessagesRead = ({
      conversationId,
      userId,
    }) => {
      if (!conversationId || !userId) {
        return;
      }

      setMessages((prev) =>
        prev.map((message) => {
          if (
            message.conversationId?.toString() ===
              conversationId?.toString() &&
            !message.readBy?.some(
              (id) =>
                id?.toString() ===
                userId?.toString()
            )
          ) {
            return {
              ...message,
              readBy: [
                ...(message.readBy || []),
                userId,
              ],
            };
          }

          return message;
        })
      );

      fetchConversations();
    };

    // ----------------------------------------------------------
    // REGISTER
    // ----------------------------------------------------------

    socket.on(
      'receive-message',
      handleReceiveMessage
    );

    socket.on(
      'user-typing',
      handleTyping
    );

    socket.on(
      'user-stopped-typing',
      handleStoppedTyping
    );

    socket.on(
      'messages-read',
      handleMessagesRead
    );

    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------

    return () => {
      socket.off(
        'receive-message',
        handleReceiveMessage
      );

      socket.off(
        'user-typing',
        handleTyping
      );

      socket.off(
        'user-stopped-typing',
        handleStoppedTyping
      );

      socket.off(
        'messages-read',
        handleMessagesRead
      );
    };
  }, [
    socket,
    user,
    currentConversation?._id,
    fetchConversations,
  ]);

  // ============================================================
  // CLEAR CHAT
  // ============================================================

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentConversation(null);
  }, []);

  // ============================================================
  // CONTEXT
  // ============================================================

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

        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error(
      'useChat must be used inside ChatProvider'
    );
  }

  return context;
};