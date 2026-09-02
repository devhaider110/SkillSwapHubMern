const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const onlineUsers = new Map();

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🟢 User ${userId} connected`);

    await User.findByIdAndUpdate(userId, { online: true });
    onlineUsers.set(userId, socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));

    socket.on('join-conversation', (conversationId) => {
      socket.join(`conv-${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conv-${conversationId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { conversationId, content, type = 'text' } = data;

        const message = new Message({
          conversationId,
          sender: userId,
          content,
          type,
          readBy: [userId],
        });
        await message.save();
        await message.populate('sender', 'name username profilePic');

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content,
          lastMessageTime: new Date(),
        });

        io.to(`conv-${conversationId}`).emit('receive-message', message);

        const conversation = await Conversation.findById(conversationId);
        const otherParticipants = conversation.participants.filter(
          (p) => p.toString() !== userId
        );

        otherParticipants.forEach((otherId) => {
          const socketId = onlineUsers.get(otherId.toString());
          if (socketId) {
            io.to(socketId).emit('new-message-notification', {
              conversationId,
              senderId: userId,
              content: content,
            });
          }
        });

        for (const participant of otherParticipants) {
          const currentUnread = conversation.unreadCount.get(participant.toString()) || 0;
          conversation.unreadCount.set(participant.toString(), currentUnread + 1);
        }
        await conversation.save();
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message-error', { message: error.message });
      }
    });

    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv-${conversationId}`).emit('user-typing', { userId, conversationId });
    });

    socket.on('stop-typing', ({ conversationId }) => {
      socket.to(`conv-${conversationId}`).emit('user-stopped-typing', { userId, conversationId });
    });

    socket.on('mark-read', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          {
            conversationId,
            readBy: { $ne: userId },
          },
          { $addToSet: { readBy: userId } }
        );

        const conversation = await Conversation.findById(conversationId);
        conversation.unreadCount.set(userId.toString(), 0);
        await conversation.save();

        io.to(`conv-${conversationId}`).emit('messages-read', {
          conversationId,
          userId,
        });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`🔴 User ${userId} disconnected`);
      await User.findByIdAndUpdate(userId, { online: false });
      onlineUsers.delete(userId);
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });
  });
};