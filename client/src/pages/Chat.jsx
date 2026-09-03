import {
  useState,
  useEffect,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';

import {
  getOrCreateConversation,
  uploadChatMedia,
} from '../services/api';

import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  User,
  Phone,
  Video,
  ArrowLeft,
  X,
  FileText,
  Image as ImageIcon,
  Play,
  Mic,
  UserX,
  Trash2,
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const {
    conversations,
    currentConversation,
    setCurrentConversation,

    messages,

    loading,

    fetchConversations,
    fetchMessages,

    sendMessage,
    markRead,

    typingUsers,
    onlineUsers,
  } = useChat();

  const [input, setInput] =
    useState('');

  const [isTyping, setIsTyping] =
    useState(false);

  const [showSidebar, setShowSidebar] =
    useState(true);

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [showMoreMenu, setShowMoreMenu] =
    useState(false);

  const [showCallModal, setShowCallModal] =
    useState(false);

  const [callType, setCallType] =
    useState('video');

  const [callRoom, setCallRoom] =
    useState('');

  const messagesEndRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  const typingTimeoutRef =
    useRef(null);

  // ============================================================
  // EMOJIS
  // ============================================================

  const emojis = [
    '😀', '😂', '😍', '🥰', '😘', '😊',
    '😎', '🤔', '😢', '😭', '😡', '😴',
    '🤗', '👍', '👎', '👏', '🙏', '❤️',
    '🔥', '✨', '🎉', '💯', '💔', '🥺',
    '🤣', '😅', '😉', '😇', '🤝', '💙',
  ];

  // ============================================================
  // FETCH CONVERSATIONS
  // ============================================================

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ============================================================
  // FETCH CURRENT MESSAGES
  // ============================================================

  useEffect(() => {
    if (!currentConversation?._id) {
      return;
    }

    fetchMessages(
      currentConversation._id
    );

    markRead(
      currentConversation._id
    );
  }, [
    currentConversation?._id,
    fetchMessages,
    markRead,
  ]);

  // ============================================================
  // SCROLL
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // ============================================================
  // CLEAN TYPING TIMER
  // ============================================================

  useEffect(() => {
    return () => {
      clearTimeout(
        typingTimeoutRef.current
      );
    };
  }, []);

  // ============================================================
  // GET OTHER USER
  // ============================================================

  const getOtherUser = (conversation) => {
    if (
      !conversation?.participants ||
      !user
    ) {
      return null;
    }

    return conversation.participants.find(
      (participant) =>
        participant._id?.toString() !==
        user._id?.toString()
    );
  };

  // ============================================================
  // ONLINE
  // ============================================================

  const isUserOnline = (userId) => {
    if (!userId) {
      return false;
    }

    return (
      onlineUsers?.some(
        (id) =>
          id?.toString() ===
          userId?.toString()
      ) || false
    );
  };

  // ============================================================
  // SELECT CONVERSATION
  // ============================================================

  const selectConversation = (
    conversation
  ) => {
    setCurrentConversation(
      conversation
    );

    setShowSidebar(false);

    markRead(
      conversation._id
    );
  };

  // ============================================================
  // START CONVERSATION
  // ============================================================

  const startConversation = async (
    userId
  ) => {
    try {
      const response =
        await getOrCreateConversation(
          userId
        );

      const conversation =
        response?.data?.conversation;

      if (!conversation) {
        return;
      }

      setCurrentConversation(
        conversation
      );

      setShowSidebar(false);

      fetchConversations();
    } catch (error) {
      console.error(
        'Failed to start conversation:',
        error
      );
    }
  };

  // ============================================================
  // SEND TEXT
  // ============================================================

  const handleSend = () => {
    if (
      !input.trim() ||
      !currentConversation
    ) {
      return;
    }

    const success = sendMessage(
      currentConversation._id,
      input.trim(),
      'text'
    );

    if (success) {
      setInput('');
      setIsTyping(false);

      clearTimeout(
        typingTimeoutRef.current
      );

      socket?.emit(
        'stop-typing',
        {
          conversationId:
            currentConversation._id,
        }
      );
    }
  };

  // ============================================================
  // TYPING
  // ============================================================

  const handleTyping = (event) => {
    const value =
      event.target.value;

    setInput(value);

    if (
      !currentConversation ||
      !socket
    ) {
      return;
    }

    if (
      value.trim() &&
      !isTyping
    ) {
      setIsTyping(true);

      socket.emit(
        'typing',
        {
          conversationId:
            currentConversation._id,
        }
      );
    }

    clearTimeout(
      typingTimeoutRef.current
    );

    typingTimeoutRef.current =
      setTimeout(() => {
        setIsTyping(false);

        socket.emit(
          'stop-typing',
          {
            conversationId:
              currentConversation._id,
          }
        );
      }, 1000);
  };

  // ============================================================
  // EMOJI
  // ============================================================

  const addEmoji = (emoji) => {
    setInput(
      (previous) =>
        previous + emoji
    );

    setShowEmojiPicker(false);
  };

  // ============================================================
  // FILE SELECT
  // ============================================================

  const handleFileSelect = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file || !currentConversation) {
      return;
    }

    setSelectedFile(file);

    // Immediately upload
    await uploadFile(file);

    event.target.value = '';
  };

  // ============================================================
  // UPLOAD FILE
  // ============================================================

  const uploadFile = async (file) => {
    if (
      !file ||
      !currentConversation
    ) {
      return;
    }

    try {
      setUploading(true);

      const response =
        await uploadChatMedia(
          file
        );

      const data =
        response?.data;

      if (
        !data?.success ||
        !data?.fileUrl
      ) {
        throw new Error(
          'Upload failed'
        );
      }

      // --------------------------------------------------------
      // Determine message type
      // --------------------------------------------------------

      let type = 'file';

      if (
        file.type.startsWith(
          'image/'
        )
      ) {
        type = 'image';
      } else if (
        file.type.startsWith(
          'video/'
        )
      ) {
        type = 'video';
      } else if (
        file.type.startsWith(
          'audio/'
        )
      ) {
        type = 'voice';
      }

      // --------------------------------------------------------
      // Send through socket
      // --------------------------------------------------------

      sendMessage(
        currentConversation._id,
        data.fileName ||
          file.name,
        type,
        data.fileUrl,
        data.fileName ||
          file.name,
        data.fileSize ||
          file.size,
        data.mimeType ||
          file.type
      );

      setSelectedFile(null);
    } catch (error) {
      console.error(
        'Chat media upload failed:',
        error
      );

      alert(
        'Failed to upload file. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // FORMAT FILE SIZE
  // ============================================================

  const formatFileSize = (
    bytes
  ) => {
    if (!bytes) {
      return '';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (
      bytes <
      1024 * 1024 * 1024
    ) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // ============================================================
  // MESSAGE PREVIEW
  // ============================================================

  const renderMessageContent = (
    message,
    isMine
  ) => {
    const bubbleClass = isMine
      ? 'text-white'
      : 'text-slate-800 dark:text-slate-100';

    // ----------------------------------------------------------
    // IMAGE
    // ----------------------------------------------------------

    if (
      message.type === 'image' &&
      message.fileUrl
    ) {
      return (
        <div>
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={message.fileUrl}
              alt={
                message.fileName ||
                'Image'
              }
              className="object-cover max-w-full cursor-pointer max-h-72 rounded-xl"
            />
          </a>

          {message.fileName && (
            <p
              className={`text-xs mt-1 ${bubbleClass} opacity-80`}
            >
              {message.fileName}
            </p>
          )}
        </div>
      );
    }

    // ----------------------------------------------------------
    // VIDEO
    // ----------------------------------------------------------

    if (
      message.type === 'video' &&
      message.fileUrl
    ) {
      return (
        <div>
          <video
            src={message.fileUrl}
            controls
            className="max-w-full max-h-72 rounded-xl"
          />

          {message.fileName && (
            <p
              className={`text-xs mt-1 ${bubbleClass} opacity-80`}
            >
              {message.fileName}
            </p>
          )}
        </div>
      );
    }

    // ----------------------------------------------------------
    // AUDIO
    // ----------------------------------------------------------

    if (
      message.type === 'voice' &&
      message.fileUrl
    ) {
      return (
        <div className="min-w-[220px]">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4" />

            <span className="text-xs">
              {message.fileName ||
                'Audio'}
            </span>
          </div>

          <audio
            src={message.fileUrl}
            controls
            className="w-full"
          />
        </div>
      );
    }

    // ----------------------------------------------------------
    // FILE
    // ----------------------------------------------------------

    if (
      message.type === 'file' &&
      message.fileUrl
    ) {
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
            <p className="text-sm font-medium truncate">
              {message.fileName ||
                'File'}
            </p>

            {message.fileSize > 0 && (
              <p className="text-xs opacity-70">
                {formatFileSize(
                  message.fileSize
                )}
              </p>
            )}
          </div>
        </a>
      );
    }

    // ----------------------------------------------------------
    // TEXT
    // ----------------------------------------------------------

    return (
      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
        {message.content}
      </p>
    );
  };

  // ============================================================
  // CALL HANDLER
  // ============================================================

 const handleCall = (type = 'video') => {
  if (!otherUser) return;

  const room = `call-${currentConversation._id}-${Date.now()}`;
  setCallRoom(room);
  setCallType(type);
  setShowCallModal(true);
  setShowMoreMenu(false);

  // Notify the other user about incoming call
  if (socket) {
    socket.emit('initiate-call', {
      conversationId: currentConversation._id,
      callerId: user._id,
      receiverId: otherUser._id,
      type,
      room,
    });
  }
};

  // ============================================================
  // CLEAR CHAT
  // ============================================================

  const clearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
      setShowMoreMenu(false);
      // Optionally call an API later to clear from backend
    }
  };

  // ============================================================
  // BLOCK USER
  // ============================================================

  const blockUser = () => {
    alert('Block user feature coming soon.');
    setShowMoreMenu(false);
  };

  // ============================================================
  // CURRENT OTHER USER
  // ============================================================

  const otherUser =
    currentConversation
      ? getOtherUser(
          currentConversation
        )
      : null;

  const currentOnline =
    otherUser
      ? isUserOnline(
          otherUser._id
        )
      : false;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex h-screen pt-16 bg-slate-50 dark:bg-slate-900">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <div
        className={`${
          showSidebar
            ? 'w-full sm:w-80'
            : 'hidden sm:flex sm:w-80'
        } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col`}
      >

        {/* Sidebar Header */}

        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Messages
          </h2>
        </div>

        {/* Conversations */}

        <div className="flex-1 overflow-y-auto">

          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <User className="w-10 h-10 mx-auto mb-3 opacity-40" />

              <p className="font-medium">
                No conversations yet
              </p>

              <p className="mt-1 text-sm">
                Start a new chat from a
                user's profile.
              </p>
            </div>
          ) : (
            conversations.map(
              (conversation) => {
                const other =
                  getOtherUser(
                    conversation
                  );

                if (!other) {
                  return null;
                }

                const online =
                  isUserOnline(
                    other._id
                  );

                return (
                  <div
                    key={
                      conversation._id
                    }
                    onClick={() =>
                      selectConversation(
                        conversation
                      )
                    }
                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                      currentConversation?._id ===
                      conversation._id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20'
                        : ''
                    }`}
                  >

                    {/* Avatar */}

                    <div className="relative flex-shrink-0">

                      <img
                        src={
                          other.profilePic ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            other.name ||
                              'User'
                          )}&background=6366f1&color=fff&size=80`
                        }
                        alt={
                          other.name
                        }
                        className="object-cover w-12 h-12 rounded-full"
                      />

                      {online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-emerald-500 dark:border-slate-800" />
                      )}
                    </div>

                    {/* Info */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center justify-between gap-2">

                        <p className="font-semibold truncate text-slate-800 dark:text-white">
                          {other.name}
                        </p>

                      </div>

                      <p className="text-sm truncate text-slate-500 dark:text-slate-400">
                        {conversation.lastMessage ||
                          'No messages yet'}
                      </p>
                    </div>

                    {/* Unread */}

                    {conversation.unreadCount >
                      0 && (
                      <span className="flex items-center justify-center h-5 px-1 text-xs text-white bg-indigo-600 rounded-full min-w-5">
                        {conversation.unreadCount >
                        99
                          ? '99+'
                          : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                );
              }
            )
          )}
        </div>
      </div>

      {/* ======================================================
          CHAT WINDOW
      ====================================================== */}

      <div
        className={`flex-1 flex flex-col min-w-0 ${
          !showSidebar
            ? 'flex'
            : 'hidden sm:flex'
        }`}
      >

        {currentConversation ? (
          <>
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-center justify-between flex-shrink-0 h-16 px-4 bg-white border-b dark:bg-slate-800 border-slate-200 dark:border-slate-700">

              <div className="flex items-center min-w-0 gap-3">

                {/* Mobile Back */}

                <button
                  onClick={() =>
                    setShowSidebar(true)
                  }
                  className="p-1 sm:hidden text-slate-600 dark:text-slate-300"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                {/* User */}

                <img
                  src={
                    otherUser?.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      otherUser?.name ||
                        'User'
                    )}&background=6366f1&color=fff&size=80`
                  }
                  alt={
                    otherUser?.name
                  }
                  className="flex-shrink-0 object-cover w-10 h-10 rounded-full"
                />

                <div className="min-w-0">

                  <p className="font-semibold truncate text-slate-800 dark:text-white">
                    {otherUser?.name ||
                      'User'}
                  </p>

                  <p
                    className={`text-xs ${
                      currentOnline
                        ? 'text-emerald-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {typingUsers[
                      currentConversation._id
                    ]
                      ? 'Typing...'
                      : currentOnline
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Header buttons */}

              <div className="relative flex items-center gap-1">

                <button
                  onClick={() => handleCall('audio')}
                  className="p-2 transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Voice call"
                >
                  <Phone className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>

                <button
                  onClick={() => handleCall('video')}
                  className="p-2 transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Video call"
                >
                  <Video className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>

                {/* Three dots */}

                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="More"
                >
                  <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 z-50 w-48 py-1 mt-1 bg-white border shadow-xl top-full dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50">
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        if (otherUser?.username) {
                          navigate(`/profile/${otherUser.username}`);
                        }
                      }}
                      className="flex items-center w-full gap-2 px-4 py-2 text-sm transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      <User className="w-4 h-4" /> View Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        clearChat();
                      }}
                      className="flex items-center w-full gap-2 px-4 py-2 text-sm transition text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      <Trash2 className="w-4 h-4" /> Clear Chat
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        blockUser();
                      }}
                      className="flex items-center w-full gap-2 px-4 py-2 text-sm transition text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      <UserX className="w-4 h-4" /> Block User
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                MESSAGES
            ================================================= */}

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">

              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 rounded-full border-slate-300 border-t-indigo-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-400">
                    <User className="mx-auto mb-3 w-14 h-14 opacity-30" />

                    <p className="font-medium">
                      No messages yet
                    </p>

                    <p className="text-sm">
                      Send a message to
                      start the conversation.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map(
                  (message, index) => {
                    const senderId =
                      message.sender?._id ||
                      message.sender;

                    const isMine =
                      senderId
                        ?.toString() ===
                      user?._id?.toString();

                    const previous =
                      messages[
                        index - 1
                      ];

                    const previousSender =
                      previous?.sender?._id ||
                      previous?.sender;

                    const showAvatar =
                      !previous ||
                      previousSender?.toString() !==
                        senderId?.toString();

                    const read =
                      message.readBy?.some(
                        (id) =>
                          id?.toString() ===
                          otherUser?._id?.toString()
                      );

                    return (
                      <div
                        key={
                          message._id ||
                          `${message.createdAt}-${index}`
                        }
                        className={`flex ${
                          isMine
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >

                        {/* Receiver avatar */}

                        {!isMine &&
                          showAvatar && (
                            <img
                              src={
                                message
                                  .sender
                                  ?.profilePic ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  message
                                    .sender
                                    ?.name ||
                                    'User'
                                )}&background=6366f1&color=fff&size=80`
                              }
                              alt=""
                              className="self-end object-cover w-8 h-8 mr-2 rounded-full"
                            />
                          )}

                        {!isMine &&
                          !showAvatar && (
                            <div className="w-8 mr-2" />
                          )}

                        {/* Bubble */}

                        <div
                          className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl shadow-sm ${
                            isMine
                              ? 'bg-indigo-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/50 dark:border-slate-600/50'
                          }`}
                        >

                          {renderMessageContent(
                            message,
                            isMine
                          )}

                          {/* Time */}

                          <div
                            className={`flex items-center justify-end gap-1 mt-1 ${
                              isMine
                                ? 'text-indigo-200'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <span className="text-[10px]">
                              {message.createdAt
                                ? new Date(
                                    message.createdAt
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )
                                : ''}
                            </span>

                            {isMine && (
                              <span
                                className={`text-[11px] ${
                                  read
                                    ? 'font-bold'
                                    : ''
                                }`}
                              >
                                {read
                                  ? '✓✓'
                                  : '✓'}
                              </span>
                            )}
                          </div>

                        </div>

                      </div>
                    );
                  }
                )
              )}

              {/* =================================================
                  TYPING
              ================================================= */}

              {typingUsers[
                currentConversation._id
              ] && (
                <div className="flex items-end">

                  <div className="w-8 mr-2" />

                  <div className="px-4 py-3 bg-white border rounded-bl-sm shadow-sm dark:bg-slate-700 rounded-2xl border-slate-200/50 dark:border-slate-600/50">

                    <div className="flex items-center gap-1">

                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />

                      <span
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{
                          animationDelay:
                            '150ms',
                        }}
                      />

                      <span
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{
                          animationDelay:
                            '300ms',
                        }}
                      />

                    </div>
                  </div>
                </div>
              )}

              <div
                ref={messagesEndRef}
              />
            </div>

            {/* =================================================
                INPUT
            ================================================= */}

            <div className="relative p-3 bg-white border-t dark:bg-slate-800 border-slate-200 dark:border-slate-700">

              {/* Emoji Picker */}

              {showEmojiPicker && (
                <div className="absolute z-50 p-3 bg-white border shadow-xl bottom-20 left-3 w-72 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl">

                  <div className="grid grid-cols-6 gap-2">

                    {emojis.map(
                      (emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            addEmoji(
                              emoji
                            )
                          }
                          className="p-2 text-xl transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          {emoji}
                        </button>
                      )
                    )}

                  </div>
                </div>
              )}

              {/* Uploading */}

              {uploading && (
                <div className="flex items-center gap-2 mb-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <div className="w-4 h-4 border-2 border-indigo-300 rounded-full border-t-indigo-600 animate-spin" />

                  Uploading file...
                </div>
              )}

              {/* Selected File */}

              {selectedFile && (
                <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-slate-100 dark:bg-slate-700">

                  <div className="flex items-center min-w-0 gap-2">

                    <FileText className="flex-shrink-0 w-4 h-4" />

                    <span className="text-sm truncate">
                      {selectedFile.name}
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      setSelectedFile(
                        null
                      )
                    }
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>

                </div>
              )}

              <div className="flex items-center gap-2">

                {/* Attachment */}

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt"
                  onChange={
                    handleFileSelect
                  }
                />

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>

                {/* Emoji */}

                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker(
                      (value) => !value
                    )
                  }
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>

                {/* Input */}

                <input
                  type="text"
                  value={input}
                  onChange={
                    handleTyping
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        'Enter' &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />

                {/* Send */}

                <button
                  type="button"
                  onClick={
                    handleSend
                  }
                  disabled={
                    !input.trim() ||
                    uploading
                  }
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

              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-5 rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                <User className="w-10 h-10 text-indigo-400" />
              </div>

              <p className="text-lg font-semibold">
                No conversation selected
              </p>

              <p className="mt-1 text-sm">
                Select a conversation
                from the sidebar to start
                chatting.
              </p>

            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          CALL MODAL
      ====================================================== */}

      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white">
                {callType === 'video' ? '📹 Video Call' : '📞 Voice Call'} with {otherUser?.name}
              </h3>
              <button
                onClick={() => setShowCallModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="flex-1 p-2">
              <iframe
                src={`https://meet.jit.si/${callRoom}?config.startWithAudioMuted=false&config.startWithVideoMuted=${callType === 'audio'}`}
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full h-full border-0 rounded-lg"
                title="Call"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;