const feathers = require('@feathersjs/feathers');
const express  = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const moment   = require('moment');
let bodyParser = require('body-parser')

const app = express(feathers());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON
app.use(express.json());

// Config Socket.io realtime APIs
let socket = app.configure(socketio(function(io) {
  io.on('connection', function(socket) {

  	socket.on('qr_attendance', function (data) {
      socket.broadcast.emit(`server_qr_attendance_${data.subject_id}_${data.instructor_id_number}`, data);
    });

    socket.on('facial_attendance', function (data) {
      socket.broadcast.emit(`server_facial_attendance_${data.subject_id}_${data.instructor_id_number}`, data);
    });

    socket.on('created_room', function (data) {
      socket.broadcast.emit(`rooms`, data);
    });

  });
}));

// Enable REST services
app.configure(express.rest());

// New connections connect to stream channel
app.on('connection', conn => app.channel('stream').join(conn));
// Publish events to stream
app.publish(data => app.channel('stream'));



const PORT = process.env.PORT || 3030;

app.post('/server/create/room', (req, res) => {
	socket.io.emit('rooms', req.body);
	 return res.status(200).json({
        code : 200,
        status : 'success'
   });
});

app
  .listen(PORT)
  .on('listening', _ => console.log(`Realtime server running on port ${PORT}`) );
