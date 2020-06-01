const { db } = require('./server/db');
const app = require('./server');
const socketio = require('socket.io');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}!`);
});

const io = socketio(server);

io.on('connection', (socket) => {
  console.log(socket.id, 'A new client has connected!');


  socket.on('joinroom', function(room) {
    socket.join(room)
    socket.on('fill', function (x, y, color, pixels, factor) {
      socket.broadcast.to(room).emit('fill', x, y, color, pixels, factor);
    }); //this is currenlty sending this to
  });

  socket.on('disconnect', function () {
    console.log('Goodbye, ', socket.id, ' :(');
  });
});
