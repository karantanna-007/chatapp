// chat.js
const socket = io();

// Handle joining the chat room
document.getElementById('join-chat').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const room = document.getElementById('room').value;

  if (username && room) {
    socket.emit('joinRoom', { username, room });

    document.getElementById('chat-window').style.display = 'block';
    document.getElementById('join-chat').style.display = 'none';
  }
});

// Listen for incoming messages from the server
socket.on('message', (message) => {
  displayMessage(message);
});

// Handle sending a new chat message
document.getElementById('send-message').addEventListener('click', () => {
  const input = document.getElementById('message-input');
  const message = input.value;
  if (message.trim() !== '') {
    socket.emit('chatMessage', message);
    input.value = '';  // Clear the input field
  }
});

// Handle sending private messages
document.getElementById('send-private-message').addEventListener('click', () => {
  const recipientId = document.getElementById('recipient-id').value;
  const message = document.getElementById('private-message-input').value;
  if (recipientId && message.trim() !== '') {
    socket.emit('privateMessage', { recipientId, msg: message });
    document.getElementById('private-message-input').value = '';  // Clear the input field
  }
});

// Display a message in the chat window with timestamp
function displayMessage({ username, text, time }) {
  const messageContainer = document.getElementById('messages');
  const div = document.createElement('div');
  div.innerHTML = `<strong>${username}</strong> [${time}]: ${text}`;
  messageContainer.appendChild(div);
  messageContainer.scrollTop = messageContainer.scrollHeight;  // Scroll to the bottom
}
