const express = require('express');
const path = require('path');
const session = require('session');
const socketio = require('socket.io');
const morgan = require('morgan');
const db = require('./db/db.js');

const port = process.env.PORT || 3000;
const app = express();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '..', '/public')))

app.get('*', function (req, res, next) {
    res.status(200).send('../public/index.html');
})

db.sync({ force: true })
const server = app.listen(port, () => console.log('Ready to Whack \'em'));
const io = socketio(server);

require('../socket/socket.js')(io);