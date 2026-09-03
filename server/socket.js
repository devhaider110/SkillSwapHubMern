// const Conversation = require('./models/Conversation');
// const Message = require('./models/Message');
// const User = require('./models/User');
// const jwt = require('jsonwebtoken');

// const onlineUsers = new Map();

// module.exports = (io) => {
//   // ============================================================
//   // SOCKET AUTHENTICATION
//   // ============================================================

//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;

//     if (!token) {
//       return next(new Error('Authentication error'));
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       socket.userId = decoded.id;
//       next();
//     } catch (error) {
//       console.error('Socket JWT Error:', error.message);
//       next(new Error('Invalid token'));
//     }
//   });

//   // ============================================================
//   // CONNECTION
//   // ============================================================

//   io.on('connection', async (socket) => {
//     const userId = socket.userId;

//     console.log(`🟢 User ${userId} connected`);

//     try {
//       await User.findByIdAndUpdate(userId, {
//         online: true,
//       });

//       onlineUsers.set(userId.toString(), socket.id);

//       io.emit(
//         'online-users',
//         Array.from(onlineUsers.keys())
//       );
//     } catch (error) {
//       console.error('Online status error:', error);
//     }

//     // ==========================================================
//     // JOIN CONVERSATION
//     // ==========================================================

//     socket.on('join-conversation', (conversationId) => {
//       if (!conversationId) return;

//       socket.join(`conv-${conversationId}`);

//       console.log(
//         `User ${userId} joined conversation ${conversationId}`
//       );
//     });

//     // ==========================================================
//     // LEAVE CONVERSATION
//     // ==========================================================

//     socket.on('leave-conversation', (conversationId) => {
//       if (!conversationId) return;

//       socket.leave(`conv-${conversationId}`);
//     });

//     // ==========================================================
//     // SEND MESSAGE
//     // ==========================================================

//     socket.on('send-message', async (data) => {
//       try {
//         const {
//           conversationId,
//           content,
//           type = 'text',
//           fileUrl = '',
//           fileName = '',
//           fileSize = 0,
//         } = data;

//         if (!conversationId) {
//           return socket.emit('message-error', {
//             message: 'Conversation ID is required',
//           });
//         }

//         if (!content && !fileUrl) {
//           return socket.emit('message-error', {
//             message: 'Message content is required',
//           });
//         }

//         // ------------------------------------------------------
//         // Create message
//         // ------------------------------------------------------

//         const message = new Message({
//           conversationId,
//           sender: userId,
//           content: content || '',
//           type,
//           fileUrl,
//           fileName,
//           fileSize,
//           readBy: [userId],
//         });

//         await message.save();

//         await message.populate(
//           'sender',
//           'name username profilePic'
//         );

//         // ------------------------------------------------------
//         // Update conversation
//         // ------------------------------------------------------

//         await Conversation.findByIdAndUpdate(
//           conversationId,
//           {
//             lastMessage:
//               content ||
//               (type === 'image'
//                 ? '📷 Image'
//                 : type === 'file'
//                 ? '📎 File'
//                 : type === 'voice'
//                 ? '🎤 Voice message'
//                 : 'New message'),

//             lastMessageTime: new Date(),
//           }
//         );

//         // ------------------------------------------------------
//         // Send message to conversation
//         // ------------------------------------------------------

//         io.to(`conv-${conversationId}`).emit(
//           'receive-message',
//           message
//         );

//         // ------------------------------------------------------
//         // Notifications
//         // ------------------------------------------------------

//         const conversation =
//           await Conversation.findById(conversationId);

//         if (!conversation) return;

//         const otherParticipants =
//           conversation.participants.filter(
//             (participant) =>
//               participant.toString() !== userId.toString()
//           );

//         for (const otherId of otherParticipants) {
//           const otherSocketId = onlineUsers.get(
//             otherId.toString()
//           );

//           if (otherSocketId) {
//             io.to(otherSocketId).emit(
//               'new-message-notification',
//               {
//                 conversationId,
//                 senderId: userId,
//                 content:
//                   content ||
//                   (type === 'image'
//                     ? '📷 Image'
//                     : type === 'file'
//                     ? '📎 File'
//                     : type === 'voice'
//                     ? '🎤 Voice message'
//                     : 'New message'),
//                 type,
//               }
//             );
//           }

//           // ----------------------------------------------------
//           // Unread count
//           // ----------------------------------------------------

//           const currentUnread =
//             conversation.unreadCount.get(
//               otherId.toString()
//             ) || 0;

//           conversation.unreadCount.set(
//             otherId.toString(),
//             currentUnread + 1
//           );
//         }

//         await conversation.save();

//         console.log(
//           `💬 Message sent by ${userId} in ${conversationId}`
//         );
//       } catch (error) {
//         console.error(
//           '❌ Send message error:',
//           error
//         );

//         socket.emit('message-error', {
//           message: error.message,
//         });
//       }
//     });

//     // ==========================================================
//     // TYPING
//     // ==========================================================

//     socket.on(
//       'typing',
//       ({ conversationId }) => {
//         if (!conversationId) return;

//         socket
//           .to(`conv-${conversationId}`)
//           .emit('user-typing', {
//             userId,
//             conversationId,
//           });
//       }
//     );

//     // ==========================================================
//     // STOP TYPING
//     // ==========================================================

//     socket.on(
//       'stop-typing',
//       ({ conversationId }) => {
//         if (!conversationId) return;

//         socket
//           .to(`conv-${conversationId}`)
//           .emit('user-stopped-typing', {
//             userId,
//             conversationId,
//           });
//       }
//     );

//     // ==========================================================
//     // MARK READ
//     // ==========================================================

//     socket.on(
//       'mark-read',
//       async ({ conversationId }) => {
//         try {
//           if (!conversationId) return;

//           await Message.updateMany(
//             {
//               conversationId,
//               readBy: {
//                 $ne: userId,
//               },
//             },
//             {
//               $addToSet: {
//                 readBy: userId,
//               },
//             }
//           );

//           const conversation =
//             await Conversation.findById(
//               conversationId
//             );

//           if (conversation) {
//             conversation.unreadCount.set(
//               userId.toString(),
//               0
//             );

//             await conversation.save();
//           }

//           io.to(`conv-${conversationId}`).emit(
//             'messages-read',
//             {
//               conversationId,
//               userId,
//             }
//           );
//         } catch (error) {
//           console.error(
//             '❌ Mark read error:',
//             error
//           );
//         }
//       }
//     );

//     // ==========================================================
//     // DISCONNECT
//     // ==========================================================

//     socket.on('disconnect', async () => {
//       console.log(`🔴 User ${userId} disconnected`);

//       try {
//         const socketId =
//           onlineUsers.get(userId.toString());

//         // Important:
//         // Don't mark offline if the user has another
//         // active socket connection.

//         if (socketId === socket.id) {
//           onlineUsers.delete(userId.toString());

//           await User.findByIdAndUpdate(
//             userId,
//             {
//               online: false,
//             }
//           );

//           io.emit(
//             'online-users',
//             Array.from(onlineUsers.keys())
//           );
//         }
//       } catch (error) {
//         console.error(
//           'Disconnect error:',
//           error
//         );
//       }
//     });
//   });
// };

// const Message = require('./models/Message');
// const Conversation = require('./models/Conversation');

// // ============================================================
// // SOCKET.IO SETUP
// // ============================================================

// const setupSocket = (io) => {
//   // ==========================================================
//   // CONNECTION
//   // ==========================================================

//   io.on('connection', (socket) => {
//     console.log(
//       `Socket connected: ${socket.id}`
//     );

//     // ========================================================
//     // USER JOIN
//     // ========================================================

//     socket.on('user-online', (userId) => {
//       if (!userId) return;

//       socket.userId = userId.toString();

//       socket.join(
//         `user:${userId.toString()}`
//       );

//       io.emit('user-status', {
//         userId: userId.toString(),
//         online: true,
//       });
//     });

//     // ========================================================
//     // JOIN CONVERSATION
//     // ========================================================

//     socket.on(
//       'join-conversation',
//       (conversationId) => {
//         if (!conversationId) return;

//         socket.join(
//           `conversation:${conversationId}`
//         );

//         console.log(
//           `Socket ${socket.id} joined conversation ${conversationId}`
//         );
//       }
//     );

//     // ========================================================
//     // LEAVE CONVERSATION
//     // ========================================================

//     socket.on(
//       'leave-conversation',
//       (conversationId) => {
//         if (!conversationId) return;

//         socket.leave(
//           `conversation:${conversationId}`
//         );
//       }
//     );

//     // ========================================================
//     // SEND MESSAGE
//     // ========================================================

//     socket.on(
//       'send-message',
//       async (data) => {
//         try {
//           const {
//             conversationId,
//             content = '',
//             type = 'text',
//             fileUrl = '',
//             fileName = '',
//             fileSize = 0,
//             mimeType = '',
//           } = data || {};

//           if (!conversationId) {
//             return;
//           }

//           // --------------------------------------------------
//           // Validate message
//           // --------------------------------------------------

//           if (
//             type === 'text' &&
//             !content?.trim()
//           ) {
//             return;
//           }

//           if (
//             type !== 'text' &&
//             !fileUrl
//           ) {
//             return;
//           }

//           // --------------------------------------------------
//           // Find conversation
//           // --------------------------------------------------

//           const conversation =
//             await Conversation.findById(
//               conversationId
//             );

//           if (!conversation) {
//             socket.emit(
//               'chat-error',
//               {
//                 message:
//                   'Conversation not found.',
//               }
//             );

//             return;
//           }

//           // --------------------------------------------------
//           // Determine sender
//           // --------------------------------------------------

//           let senderId =
//             socket.userId;

//           // If SocketContext sends userId
//           if (
//             !senderId &&
//             data.senderId
//           ) {
//             senderId =
//               data.senderId.toString();
//           }

//           // --------------------------------------------------
//           // Fallback sender
//           // --------------------------------------------------

//           if (!senderId) {
//             socket.emit(
//               'chat-error',
//               {
//                 message:
//                   'Unable to identify sender.',
//               }
//             );

//             return;
//           }

//           // --------------------------------------------------
//           // Make sure sender belongs to conversation
//           // --------------------------------------------------

//           const isParticipant =
//             conversation.participants.some(
//               (participant) =>
//                 participant.toString() ===
//                 senderId.toString()
//             );

//           if (!isParticipant) {
//             socket.emit(
//               'chat-error',
//               {
//                 message:
//                   'You are not a participant of this conversation.',
//               }
//             );

//             return;
//           }

//           // --------------------------------------------------
//           // Create message
//           // --------------------------------------------------

//           const message =
//             await Message.create({
//               conversationId,
//               sender: senderId,
//               content:
//                 content?.trim() || '',
//               type,
//               fileUrl:
//                 fileUrl || '',
//               fileName:
//                 fileName || '',
//               fileSize:
//                 Number(fileSize) || 0,
//               readBy: [senderId],
//             });

//           // --------------------------------------------------
//           // Update conversation
//           // --------------------------------------------------

//           const unreadUpdate = {};

//           conversation.participants.forEach(
//             (participant) => {
//               const participantId =
//                 participant.toString();

//               if (
//                 participantId !==
//                 senderId.toString()
//               ) {
//                 unreadUpdate[
//                   `unreadCount.${participantId}`
//                 ] = 1;
//               }
//             }
//           );

//           conversation.lastMessage =
//             type === 'text'
//               ? content.trim()
//               : fileName || type;

//           conversation.lastMessageTime =
//             new Date();

//           // Increment unread count
//           for (const participant of conversation.participants) {
//             const participantId =
//               participant.toString();

//             if (
//               participantId !==
//               senderId.toString()
//             ) {
//               const currentCount =
//                 conversation.unreadCount.get(
//                   participantId
//                 ) || 0;

//               conversation.unreadCount.set(
//                 participantId,
//                 currentCount + 1
//               );
//             }
//           }

//           await conversation.save();

//           // --------------------------------------------------
//           // Populate sender
//           // --------------------------------------------------

//           const populatedMessage =
//             await Message.findById(
//               message._id
//             ).populate(
//               'sender',
//               'name username profilePic'
//             );

//           // --------------------------------------------------
//           // Send to conversation
//           // --------------------------------------------------

//           io.to(
//             `conversation:${conversationId}`
//           ).emit(
//             'receive-message',
//             populatedMessage
//           );

//           // --------------------------------------------------
//           // Also notify participants who aren't in room
//           // --------------------------------------------------

//           conversation.participants.forEach(
//             (participant) => {
//               const participantId =
//                 participant.toString();

//               if (
//                 participantId !==
//                 senderId.toString()
//               ) {
//                 io.to(
//                   `user:${participantId}`
//                 ).emit(
//                   'new-message-notification',
//                   populatedMessage
//                 );
//               }
//             }
//           );
//         } catch (error) {
//           console.error(
//             'Socket send-message error:',
//             error
//           );

//           socket.emit(
//             'chat-error',
//             {
//               message:
//                 'Failed to send message.',
//             }
//           );
//         }
//       }
//     );

//     // ========================================================
//     // TYPING
//     // ========================================================

//     socket.on(
//       'typing',
//       ({ conversationId }) => {
//         if (!conversationId) return;

//         socket
//           .to(
//             `conversation:${conversationId}`
//           )
//           .emit(
//             'user-typing',
//             {
//               userId:
//                 socket.userId,
//               conversationId,
//             }
//           );
//       }
//     );

//     // ========================================================
//     // STOP TYPING
//     // ========================================================

//     socket.on(
//       'stop-typing',
//       ({ conversationId }) => {
//         if (!conversationId) return;

//         socket
//           .to(
//             `conversation:${conversationId}`
//           )
//           .emit(
//             'user-stopped-typing',
//             {
//               userId:
//                 socket.userId,
//               conversationId,
//             }
//           );
//       }
//     );

//     // ========================================================
//     // MARK READ
//     // ========================================================

//     socket.on(
//       'mark-read',
//       async ({ conversationId }) => {
//         try {
//           if (
//             !conversationId ||
//             !socket.userId
//           ) {
//             return;
//           }

//           // --------------------------------------------------
//           // Mark all messages as read
//           // --------------------------------------------------

//           await Message.updateMany(
//             {
//               conversationId,
//               sender: {
//                 $ne: socket.userId,
//               },
//               readBy: {
//                 $ne: socket.userId,
//               },
//             },
//             {
//               $addToSet: {
//                 readBy:
//                   socket.userId,
//               },
//             }
//           );

//           // --------------------------------------------------
//           // Reset unread count
//           // --------------------------------------------------

//           const conversation =
//             await Conversation.findById(
//               conversationId
//             );

//           if (conversation) {
//             conversation.unreadCount.set(
//               socket.userId,
//               0
//             );

//             await conversation.save();
//           }

//           // --------------------------------------------------
//           // Notify conversation
//           // --------------------------------------------------

//           socket
//             .to(
//               `conversation:${conversationId}`
//             )
//             .emit(
//               'messages-read',
//               {
//                 conversationId,
//                 userId:
//                   socket.userId,
//               }
//             );
//         } catch (error) {
//           console.error(
//             'Socket mark-read error:',
//             error
//           );
//         }
//       }
//     );

//     // ========================================================
//     // DISCONNECT
//     // ========================================================

//     socket.on(
//       'disconnect',
//       () => {
//         console.log(
//           `Socket disconnected: ${socket.id}`
//         );

//         if (socket.userId) {
//           io.emit(
//             'user-status',
//             {
//               userId:
//                 socket.userId,
//               online: false,
//             }
//           );
//         }
//       }
//     );
//   });
// };

// module.exports = setupSocket;


const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // When user logs in, they should emit user-online with userId
    socket.on('user-online', (userId) => {
      if (!userId) return;
      socket.userId = userId.toString();
      socket.join(`user:${userId.toString()}`);
      io.emit('user-status', { userId: userId.toString(), online: true });
    });

    socket.on('join-conversation', (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
    });

    // ✅ SEND MESSAGE – Corrected
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

        // Validate content
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

        // Determine sender (must be set from socket.userId)
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

        // Update conversation last message and unread counts
        conversation.lastMessage = type === 'text' ? content.trim() : fileName || type;
        conversation.lastMessageTime = new Date();

        // Increment unread for all other participants
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

        // Notify each participant individually (for those not in room)
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

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId) {
        io.emit('user-status', { userId: socket.userId, online: false });
      }
    });
  });
};