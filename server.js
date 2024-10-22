// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const moment = require('moment'); // For timestamps

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (client-side)
app.use(express.static(path.join(__dirname, 'public')));

let users = {}; // Store connected users and their socket IDs

// Listen for new connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining a room with a username
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };

    // Welcome current user
    socket.emit('message', formatMessage('Chat Bot', 'Welcome to the chat!', room));

    // Broadcast when a user connects (except the user who just connected)
    socket.broadcast
      .to(room)
      .emit('message', formatMessage('Chat Bot', `${username} has joined the chat`, room));
  });

  // Listen for chat messages
  socket.on('chatMessage', (msg) => {
    const user = users[socket.id];
    io.to(user.room).emit('message', formatMessage(user.username, msg, user.room));
  });

  // Handle private messaging
  socket.on('privateMessage', ({ recipientId, msg }) => {
    const sender = users[socket.id];
    socket.to(recipientId).emit('message', formatMessage(`${sender.username} (Private)`, msg, sender.room));
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage('Chat Bot', `${user.username} has left the chat`, user.room)
      );
      delete users[socket.id];
    }
  });
});

// Format messages with timestamps
function formatMessage(username, text, room) {
  return {
    username,
    text,
    room,
    time: moment().format('h:mm a')
  };
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
