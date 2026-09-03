const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const onlineUsers = new Map();

module.exports = (io) => {
  // ============================================================
  // SOCKET AUTHENTICATION
  // ============================================================

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;
      next();
    } catch (error) {
      console.error('Socket JWT Error:', error.message);
      next(new Error('Invalid token'));
    }
  });

  // ============================================================
  // CONNECTION
  // ============================================================

  io.on('connection', async (socket) => {
    const userId = socket.userId;

    console.log(`🟢 User ${userId} connected`);

    try {
      await User.findByIdAndUpdate(userId, {
        online: true,
      });

      onlineUsers.set(userId.toString(), socket.id);

      io.emit(
        'online-users',
        Array.from(onlineUsers.keys())
      );
    } catch (error) {
      console.error('Online status error:', error);
    }

    // ==========================================================
    // JOIN CONVERSATION
    // ==========================================================

    socket.on('join-conversation', (conversationId) => {
      if (!conversationId) return;

      socket.join(`conv-${conversationId}`);

      console.log(
        `User ${userId} joined conversation ${conversationId}`
      );
    });

    // ==========================================================
    // LEAVE CONVERSATION
    // ==========================================================

    socket.on('leave-conversation', (conversationId) => {
      if (!conversationId) return;

      socket.leave(`conv-${conversationId}`);
    });

    // ==========================================================
    // SEND MESSAGE
    // ==========================================================

    socket.on('send-message', async (data) => {
      try {
        const {
          conversationId,
          content,
          type = 'text',
          fileUrl = '',
          fileName = '',
          fileSize = 0,
        } = data;

        if (!conversationId) {
          return socket.emit('message-error', {
            message: 'Conversation ID is required',
          });
        }

        if (!content && !fileUrl) {
          return socket.emit('message-error', {
            message: 'Message content is required',
          });
        }

        // ------------------------------------------------------
        // Create message
        // ------------------------------------------------------

        const message = new Message({
          conversationId,
          sender: userId,
          content: content || '',
          type,
          fileUrl,
          fileName,
          fileSize,
          readBy: [userId],
        });

        await message.save();

        await message.populate(
          'sender',
          'name username profilePic'
        );

        // ------------------------------------------------------
        // Update conversation
        // ------------------------------------------------------

        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            lastMessage:
              content ||
              (type === 'image'
                ? '📷 Image'
                : type === 'file'
                ? '📎 File'
                : type === 'voice'
                ? '🎤 Voice message'
                : 'New message'),

            lastMessageTime: new Date(),
          }
        );

        // ------------------------------------------------------
        // Send message to conversation
        // ------------------------------------------------------

        io.to(`conv-${conversationId}`).emit(
          'receive-message',
          message
        );

        // ------------------------------------------------------
        // Notifications
        // ------------------------------------------------------

        const conversation =
          await Conversation.findById(conversationId);

        if (!conversation) return;

        const otherParticipants =
          conversation.participants.filter(
            (participant) =>
              participant.toString() !== userId.toString()
          );

        for (const otherId of otherParticipants) {
          const otherSocketId = onlineUsers.get(
            otherId.toString()
          );

          if (otherSocketId) {
            io.to(otherSocketId).emit(
              'new-message-notification',
              {
                conversationId,
                senderId: userId,
                content:
                  content ||
                  (type === 'image'
                    ? '📷 Image'
                    : type === 'file'
                    ? '📎 File'
                    : type === 'voice'
                    ? '🎤 Voice message'
                    : 'New message'),
                type,
              }
            );
          }

          // ----------------------------------------------------
          // Unread count
          // ----------------------------------------------------

          const currentUnread =
            conversation.unreadCount.get(
              otherId.toString()
            ) || 0;

          conversation.unreadCount.set(
            otherId.toString(),
            currentUnread + 1
          );
        }

        await conversation.save();

        console.log(
          `💬 Message sent by ${userId} in ${conversationId}`
        );
      } catch (error) {
        console.error(
          '❌ Send message error:',
          error
        );

        socket.emit('message-error', {
          message: error.message,
        });
      }
    });

    // ==========================================================
    // TYPING
    // ==========================================================

    socket.on(
      'typing',
      ({ conversationId }) => {
        if (!conversationId) return;

        socket
          .to(`conv-${conversationId}`)
          .emit('user-typing', {
            userId,
            conversationId,
          });
      }
    );

    // ==========================================================
    // STOP TYPING
    // ==========================================================

    socket.on(
      'stop-typing',
      ({ conversationId }) => {
        if (!conversationId) return;

        socket
          .to(`conv-${conversationId}`)
          .emit('user-stopped-typing', {
            userId,
            conversationId,
          });
      }
    );

    // ==========================================================
    // MARK READ
    // ==========================================================

    socket.on(
      'mark-read',
      async ({ conversationId }) => {
        try {
          if (!conversationId) return;

          await Message.updateMany(
            {
              conversationId,
              readBy: {
                $ne: userId,
              },
            },
            {
              $addToSet: {
                readBy: userId,
              },
            }
          );

          const conversation =
            await Conversation.findById(
              conversationId
            );

          if (conversation) {
            conversation.unreadCount.set(
              userId.toString(),
              0
            );

            await conversation.save();
          }

          io.to(`conv-${conversationId}`).emit(
            'messages-read',
            {
              conversationId,
              userId,
            }
          );
        } catch (error) {
          console.error(
            '❌ Mark read error:',
            error
          );
        }
      }
    );

    // ==========================================================
    // DISCONNECT
    // ==========================================================

    socket.on('disconnect', async () => {
      console.log(`🔴 User ${userId} disconnected`);

      try {
        const socketId =
          onlineUsers.get(userId.toString());

        // Important:
        // Don't mark offline if the user has another
        // active socket connection.

        if (socketId === socket.id) {
          onlineUsers.delete(userId.toString());

          await User.findByIdAndUpdate(
            userId,
            {
              online: false,
            }
          );

          io.emit(
            'online-users',
            Array.from(onlineUsers.keys())
          );
        }
      } catch (error) {
        console.error(
          'Disconnect error:',
          error
        );
      }
    });
  });
};