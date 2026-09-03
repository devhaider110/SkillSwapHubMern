import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';

import { getOrCreateConversation, uploadChatMedia } from '../services/api';

import {
  Send,
  Paperclip,
  Smile,
  User,
  ArrowLeft,
  X,
  FileText,
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket(); // ✅ Get onlineUsers from SocketContext
  const navigate = useNavigate();

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
  } = useChat();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const emojis = [
    '😀', '😂', '😍', '🥰', '😘', '😊',
    '😎', '🤔', '😢', '😭', '😡', '😴',
    '🤗', '👍', '👎', '👏', '🙏', '❤️',
    '🔥', '✨', '🎉', '💯', '💔', '🥺',
    '🤣', '😅', '😉', '😇', '🤝', '💙',
  ];

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!currentConversation?._id) return;
    fetchMessages(currentConversation._id);
    markRead(currentConversation._id);
  }, [currentConversation?._id, fetchMessages, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  const getOtherUser = (conversation) => {
    if (!conversation?.participants || !user) return null;
    return conversation.participants.find(
      (p) => p._id?.toString() !== user._id?.toString()
    );
  };

  // ✅ Fix: Check onlineUsers (array of user IDs)
  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.some((id) => id?.toString() === userId?.toString());
  };

  const selectConversation = (conversation) => {
    setCurrentConversation(conversation);
    setShowSidebar(false);
    markRead(conversation._id);
  };

  const handleSend = () => {
    if (!input.trim() || !currentConversation) return;
    const success = sendMessage(currentConversation._id, input.trim(), 'text');
    if (success) {
      setInput('');
      setIsTyping(false);
      clearTimeout(typingTimeoutRef.current);
      socket?.emit('stop-typing', { conversationId: currentConversation._id });
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);
    if (!currentConversation || !socket) return;
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId: currentConversation._id });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop-typing', { conversationId: currentConversation._id });
    }, 1000);
  };

  const addEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentConversation) return;
    setSelectedFile(file);
    await uploadFile(file);
    event.target.value = '';
  };

  const uploadFile = async (file) => {
    if (!file || !currentConversation) return;
    try {
      setUploading(true);
      const response = await uploadChatMedia(file);
      const data = response?.data;
      if (!data?.success || !data?.fileUrl) throw new Error('Upload failed');
      let type = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      sendMessage(
        currentConversation._id,
        data.fileName || file.name,
        type,
        data.fileUrl,
        data.fileName || file.name,
        data.fileSize || file.size,
        data.mimeType || file.type
      );
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const renderMessageContent = (message, isMine) => {
    const bubbleClass = isMine ? 'text-white' : 'text-slate-800 dark:text-slate-100';

    if (message.type === 'image' && message.fileUrl) {
      return (
        <div>
          <a href={message.fileUrl} target="_blank" rel="noreferrer">
            <img
              src={message.fileUrl}
              alt={message.fileName || 'Image'}
              className="object-cover max-w-full cursor-pointer max-h-72 rounded-xl"
            />
          </a>
          {message.fileName && (
            <p className={`text-xs mt-1 ${bubbleClass} opacity-80`}>
              {message.fileName}
            </p>
          )}
        </div>
      );
    }

    if (message.type === 'file' && message.fileUrl) {
      return (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noreferrer"
          className={`flex items-center gap-3 min-w-[220px] ${bubbleClass}`}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/10 dark:bg-white/10">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{message.fileName || 'File'}</p>
            {message.fileSize > 0 && (
              <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
            )}
          </div>
        </a>
      );
    }

    return (
      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
        {message.content}
      </p>
    );
  };

  const otherUser = currentConversation ? getOtherUser(currentConversation) : null;
  const currentOnline = otherUser ? isUserOnline(otherUser._id) : false;

  // ✅ Debug: Log online users
  console.log('👥 Online users:', onlineUsers);
  console.log('👤 Other user online?', currentOnline);

  return (
    <div className="flex h-screen pt-16 bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-full sm:w-80' : 'hidden sm:flex sm:w-80'
        } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No conversations yet</p>
              <p className="mt-1 text-sm">Start a new chat from a user's profile.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherUser(conv);
              if (!other) return null;
              const online = isUserOnline(other._id);
              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                    currentConversation?._id === conv._id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20'
                      : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        other.profilePic ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          other.name || 'User'
                        )}&background=6366f1&color=fff&size=80`
                      }
                      alt={other.name}
                      className="object-cover w-12 h-12 rounded-full"
                    />
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-emerald-500 dark:border-slate-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-slate-800 dark:text-white">
                      {other.name}
                    </p>
                    <p className="text-sm truncate text-slate-500 dark:text-slate-400">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex items-center justify-center h-5 px-1 text-xs text-white bg-indigo-600 rounded-full min-w-5">
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          !showSidebar ? 'flex' : 'hidden sm:flex'
        }`}
      >
        {currentConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0 h-16 px-4 bg-white border-b dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <div className="flex items-center min-w-0 gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-1 sm:hidden text-slate-600 dark:text-slate-300"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <img
                  src={
                    otherUser?.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      otherUser?.name || 'User'
                    )}&background=6366f1&color=fff&size=80`
                  }
                  alt={otherUser?.name}
                  className="flex-shrink-0 object-cover w-10 h-10 rounded-full"
                />
                <div className="min-w-0">
                  <p className="font-semibold truncate text-slate-800 dark:text-white">
                    {otherUser?.name || 'User'}
                  </p>
                  <p
                    className={`text-xs ${
                      typingUsers[currentConversation._id]
                        ? 'text-indigo-500 dark:text-indigo-400'
                        : currentOnline
                        ? 'text-emerald-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {typingUsers[currentConversation._id]
                      ? 'Typing...'
                      : currentOnline
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>
              {/* No extra buttons */}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 rounded-full border-slate-300 border-t-indigo-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-400">
                    <User className="mx-auto mb-3 w-14 h-14 opacity-30" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const isMine = senderId?.toString() === user._id?.toString();
                  const previous = messages[idx - 1];
                  const prevSender = previous?.sender?._id || previous?.sender;
                  const showAvatar = !previous || prevSender?.toString() !== senderId?.toString();
                  // ✅ Check if the message is read by the other user
                  const read = msg.readBy?.some(
                    (id) => id?.toString() === otherUser?._id?.toString()
                  );

                  return (
                    <div
                      key={msg._id || `${msg.createdAt}-${idx}`}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && showAvatar && (
                        <img
                          src={
                            msg.sender?.profilePic ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              msg.sender?.name || 'User'
                            )}&background=6366f1&color=fff&size=80`
                          }
                          alt=""
                          className="self-end object-cover w-8 h-8 mr-2 rounded-full"
                        />
                      )}
                      {!isMine && !showAvatar && <div className="w-8 mr-2" />}

                      <div
                        className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl shadow-sm ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/50 dark:border-slate-600/50'
                        }`}
                      >
                        {renderMessageContent(msg, isMine)}
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 ${
                            isMine ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <span className="text-[10px]">
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                          {isMine && (
                            <span className={`text-[11px] ${read ? 'font-bold' : ''}`}>
                              {read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {typingUsers[currentConversation._id] && (
                <div className="flex items-end">
                  <div className="w-8 mr-2" />
                  <div className="px-4 py-3 bg-white border rounded-bl-sm shadow-sm dark:bg-slate-700 rounded-2xl border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="relative p-3 bg-white border-t dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              {showEmojiPicker && (
                <div className="absolute z-50 p-3 bg-white border shadow-xl bottom-20 left-3 w-72 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        className="p-2 text-xl transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="flex items-center gap-2 mb-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <div className="w-4 h-4 border-2 border-indigo-300 rounded-full border-t-indigo-600 animate-spin" />
                  Uploading file...
                </div>
              )}

              {selectedFile && (
                <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <div className="flex items-center min-w-0 gap-2">
                    <FileText className="flex-shrink-0 w-4 h-4" />
                    <span className="text-sm truncate">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={handleTyping}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || uploading}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md transition"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-slate-500 dark:text-slate-400">
            <div className="px-6 text-center">
              <User className="mx-auto mb-4 w-14 h-14 opacity-30" />
              <p className="text-lg font-semibold">No conversation selected</p>
              <p className="mt-1 text-sm">Select a conversation from the sidebar to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;