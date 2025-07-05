import { Server } from 'socket.io';
import http from 'http';

// Socket.io server setup
export function setupSocketIO(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3002",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.id}`);
    
    // Join user to their personal room for notifications
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`👤 User ${userId} joined personal room`);
    });

    // Join support chat room
    socket.on('join-support', (ticketId: string) => {
      socket.join(`support-${ticketId}`);
      console.log(`🎫 Joined support chat for ticket: ${ticketId}`);
    });

    // Handle chat messages
    socket.on('send-message', (data: {
      ticketId: string;
      message: string;
      userId: string;
      userName: string;
    }) => {
      // Broadcast message to all users in the support room
      io.to(`support-${data.ticketId}`).emit('new-message', {
        id: Date.now().toString(),
        content: data.message,
        sender: {
          firstName: data.userName.split(' ')[0],
          lastName: data.userName.split(' ')[1] || '',
          role: 'CUSTOMER'
        },
        timestamp: new Date().toISOString()
      });
    });

    // Handle admin responses
    socket.on('admin-response', (data: {
      ticketId: string;
      message: string;
      adminName: string;
    }) => {
      io.to(`support-${data.ticketId}`).emit('new-message', {
        id: Date.now().toString(),
        content: data.message,
        sender: {
          firstName: data.adminName.split(' ')[0],
          lastName: data.adminName.split(' ')[1] || '',
          role: 'ADMIN'
        },
        timestamp: new Date().toISOString()
      });
    });

    // Handle notifications
    socket.on('send-notification', (data: {
      userId?: string;
      title: string;
      message: string;
      type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    }) => {
      if (data.userId) {
        // Send to specific user
        io.to(`user-${data.userId}`).emit('new-notification', {
          id: Date.now().toString(),
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else {
        // Broadcast to all users
        io.emit('new-notification', {
          id: Date.now().toString(),
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Handle speed test events
    socket.on('start-speed-test', () => {
      // Simulate speed test progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        socket.emit('speed-test-progress', { progress });
        
        if (progress >= 100) {
          clearInterval(interval);
          // Simulate speed test results
          const results = {
            downloadSpeed: Math.random() * 100 + 50,
            uploadSpeed: Math.random() * 50 + 10,
            ping: Math.random() * 30 + 5,
            jitter: Math.random() * 5 + 1
          };
          socket.emit('speed-test-complete', results);
        }
      }, 500);
    });

    // Handle network outage reports
    socket.on('report-outage', (data: {
      location: string;
      description: string;
      userId: string;
    }) => {
      // Broadcast outage to all users in the area
      io.emit('network-outage', {
        id: Date.now().toString(),
        location: data.location,
        description: data.description,
        status: 'ONGOING',
        reportedAt: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔗 User disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Helper function to send notifications via Socket.io
export function sendNotificationViaSocket(io: Server, userId: string | null, notification: any) {
  if (userId) {
    io.to(`user-${userId}`).emit('new-notification', notification);
  } else {
    io.emit('new-notification', notification);
  }
}
