const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const jwt = require('jsonwebtoken');

const onlineUsers = new Map();

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: no token'));
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

    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      io.emit('online-users', Array.from(onlineUsers.keys()));
      socket.join(`user:${socket.userId}`);
    }

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

    socket.on('send-message', async (data) => {
      try {
        const { conversationId, content = '', type = 'text', fileUrl = '', fileName = '', fileSize = 0, mimeType = '' } = data || {};
        if (!conversationId) return;
        if (type === 'text' && !content?.trim()) return;
        if (type !== 'text' && !fileUrl) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('chat-error', { message: 'Conversation not found.' });
          return;
        }

        let senderId = socket.userId;
        if (!senderId && data.senderId) senderId = data.senderId.toString();
        if (!senderId) {
          socket.emit('chat-error', { message: 'Unable to identify sender.' });
          return;
        }

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === senderId.toString()
        );
        if (!isParticipant) {
          socket.emit('chat-error', { message: 'You are not a participant.' });
          return;
        }

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

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name username profilePic'
        );

        conversation.lastMessage = type === 'text' ? content.trim() : fileName || type;
        conversation.lastMessageTime = new Date();

        for (const participant of conversation.participants) {
          const pid = participant.toString();
          if (pid !== senderId.toString()) {
            const current = conversation.unreadCount.get(pid) || 0;
            conversation.unreadCount.set(pid, current + 1);
          }
        }
        await conversation.save();

        io.to(`conversation:${conversationId}`).emit('receive-message', populatedMessage);

        conversation.participants.forEach((p) => {
          const pid = p.toString();
          if (pid !== senderId.toString()) {
            io.to(`user:${pid}`).emit('new-message-notification', populatedMessage);
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
        await Message.updateMany(
          {
            conversationId,
            sender: { $ne: socket.userId },
            readBy: { $ne: socket.userId },
          },
          { $addToSet: { readBy: socket.userId } }
        );
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

    socket.on('initiate-call', ({ conversationId, callerId, receiverId, type, room }) => {
      io.to(`user:${receiverId}`).emit('incoming-call', {
        conversationId,
        callerId,
        callerName: socket.userId,
        type,
        room,
      });
    });

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