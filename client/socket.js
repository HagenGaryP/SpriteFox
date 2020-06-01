import io from 'socket.io-client';

const socket = io(window.location.origin);

socket.on('connect', function () {
  console.log('Socket Connected');
});
// establishes socket connection
// import './socket'

export default socket;
