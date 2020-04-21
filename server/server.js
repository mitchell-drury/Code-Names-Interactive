const express = require('express');
const path = require('path');
const session = require('express-session');
const socketio = require('socket.io');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var sessionMware = session({
    secret: 'somereallylongrandomstring',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*60*60*24
    }
})
app.use(sessionMware);

app.use(express.static(path.join(__dirname, '..', '/public')))
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'))
})

const server = app.listen(port, () => console.log('Server Running'));

const io = socketio(server);
require('../socket/socket.js')(io);
io.use(function(socket, next){
    sessionMware(socket.request, socket.request.res, next)
})