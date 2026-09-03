const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const jwt = require('jsonwebtoken');

// Map to store online users: userId -> socketId
const onlineUsers = new Map();

module.exports = (io) => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: no token'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, userId: ${socket.userId}`);

    // Register user as online
    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      io.emit('online-users', Array.from(onlineUsers.keys()));
    }

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // --- User online (optional, but we already set above) ---
    socket.on('user-online', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        io.emit('online-users', Array.from(onlineUsers.keys()));
      }
    });

    socket.on('join-conversation', (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
    });

    // --- SEND MESSAGE ---
    socket.on('send-message', async (data) => {
      try {
        const {
          conversationId,
          content = '',
          type = 'text',
          fileUrl = '',
          fileName = '',
          fileSize = 0,
          mimeType = '',
        } = data || {};

        if (!conversationId) {
          console.error('Missing conversationId');
          return;
        }

        // Validate
        if (type === 'text' && !content?.trim()) {
          console.error('Empty text message');
          return;
        }
        if (type !== 'text' && !fileUrl) {
          console.error('Media message without fileUrl');
          return;
        }

        // Get conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('chat-error', { message: 'Conversation not found.' });
          return;
        }

        // Determine sender
        let senderId = socket.userId;
        if (!senderId && data.senderId) {
          senderId = data.senderId.toString();
        }
        if (!senderId) {
          socket.emit('chat-error', { message: 'Unable to identify sender.' });
          return;
        }

        // Check participant
        const isParticipant = conversation.participants.some(
          (participant) => participant.toString() === senderId.toString()
        );
        if (!isParticipant) {
          socket.emit('chat-error', { message: 'You are not a participant.' });
          return;
        }

        // Create message
        const message = await Message.create({
          conversationId,
          sender: senderId,
          content: content?.trim() || '',
          type,
          fileUrl: fileUrl || '',
          fileName: fileName || '',
          fileSize: Number(fileSize) || 0,
          readBy: [senderId],
        });

        // Populate sender
        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name username profilePic'
        );

        // Update conversation
        conversation.lastMessage = type === 'text' ? content.trim() : fileName || type;
        conversation.lastMessageTime = new Date();

        // Increment unread for other participants
        for (const participant of conversation.participants) {
          const participantId = participant.toString();
          if (participantId !== senderId.toString()) {
            const currentCount = conversation.unreadCount.get(participantId) || 0;
            conversation.unreadCount.set(participantId, currentCount + 1);
          }
        }
        await conversation.save();

        // Broadcast to conversation room
        io.to(`conversation:${conversationId}`).emit('receive-message', populatedMessage);

        // Notify each participant individually
        conversation.participants.forEach((participant) => {
          const participantId = participant.toString();
          if (participantId !== senderId.toString()) {
            io.to(`user:${participantId}`).emit('new-message-notification', populatedMessage);
          }
        });
      } catch (error) {
        console.error('Socket send-message error:', error);
        socket.emit('chat-error', { message: 'Failed to send message.' });
      }
    });

    socket.on('typing', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on('stop-typing', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on('mark-read', async ({ conversationId }) => {
      try {
        if (!conversationId || !socket.userId) return;

        // Mark messages as read
        await Message.updateMany(
          {
            conversationId,
            sender: { $ne: socket.userId },
            readBy: { $ne: socket.userId },
          },
          { $addToSet: { readBy: socket.userId } }
        );

        // Reset unread count
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.unreadCount.set(socket.userId, 0);
          await conversation.save();
        }

        io.to(`conversation:${conversationId}`).emit('messages-read', {
          conversationId,
          userId: socket.userId,
        });
      } catch (error) {
        console.error('mark-read error:', error);
      }
    });

    // --- INCOMING CALL NOTIFICATION ---
    socket.on('initiate-call', ({ conversationId, callerId, receiverId, type, room }) => {
      // Notify the receiver
      io.to(`user:${receiverId}`).emit('incoming-call', {
        conversationId,
        callerId,
        callerName: socket.userId, // We'll fetch name from DB later
        type,
        room,
      });
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online-users', Array.from(onlineUsers.keys()));
        io.emit('user-status', { userId: socket.userId, online: false });
      }
    });
  });
};