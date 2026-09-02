import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { getOrCreateConversation } from '../services/api';
import { Send, Paperclip, Smile, MoreVertical, User, Phone, Video, ArrowLeft } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const {
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
  } = useChat();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation._id);
      markRead(currentConversation._id);
      socket?.emit('join-conversation', currentConversation._id);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !currentConversation) return;
    sendMessage(currentConversation._id, input.trim());
    setInput('');
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { conversationId: currentConversation._id });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('stop-typing', { conversationId: currentConversation._id });
    }, 1000);
  };

  const startConversation = async (userId) => {
    try {
      const res = await getOrCreateConversation(userId);
      const conv = res.data.conversation;
      setCurrentConversation(conv);
      setShowSidebar(false);
      fetchConversations();
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const getOtherUser = (conv) => {
    return conv.participants.find((p) => p._id !== user._id);
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.includes(userId);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 pt-16">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-full sm:w-80' : 'hidden sm:block sm:w-80'
        } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherUser(conv);
              const online = isUserOnline(other?._id);
              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    setCurrentConversation(conv);
                    setShowSidebar(false);
                  }}
                  className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                    currentConversation?._id === conv._id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={other?.profilePic || `https://ui-avatars.com/api/?name=${other?.name}&background=6366f1&color=fff&size=40`}
                      alt={other?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {other?.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${!showSidebar ? 'block' : 'hidden sm:flex'}`}>
        {currentConversation ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="sm:hidden text-slate-600 dark:text-slate-300"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                {(() => {
                  const other = getOtherUser(currentConversation);
                  const online = isUserOnline(other?._id);
                  return (
                    <>
                      <img
                        src={other?.profilePic || `https://ui-avatars.com/api/?name=${other?.name}&background=6366f1&color=fff&size=40`}
                        alt={other?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{other?.name}</p>
                        <p className="text-xs text-emerald-500">{online ? 'Online' : 'Offline'}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Phone className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Video className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                  <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => {
                const isMine = msg.sender._id === user._id;
                const prevMsg = messages[idx - 1];
                const showAvatar = !prevMsg || prevMsg.sender._id !== msg.sender._id;

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMine && showAvatar && (
                      <img
                        src={msg.sender.profilePic || `https://ui-avatars.com/api/?name=${msg.sender.name}&background=6366f1&color=fff&size=32`}
                        alt={msg.sender.name}
                        className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                      />
                    )}
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/50 dark:border-slate-600/50'
                    }`}>
                      {!isMine && !showAvatar && (
                        <div className="h-8 w-8 -mt-2 -ml-2 -mr-2 mb-1"></div>
                      )}
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${
                        isMine ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        <span className="text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          <span className="text-[10px]">
                            {msg.readBy?.includes(user._id) ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                    {isMine && showAvatar && (
                      <div className="w-8 h-8 ml-2 self-end"></div>
                    )}
                  </div>
                );
              })}
              {typingUsers[currentConversation?._id] && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce animation-delay-200"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce animation-delay-400"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <Paperclip className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
              <input
                type="text"
                value={input}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <Smile className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-lg font-semibold">No conversation selected</p>
              <p className="text-sm">Select a conversation from the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;