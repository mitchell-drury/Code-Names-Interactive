const User = require('../server/db/models/user.js');
const Op = require('sequelize').Op;

module.exports = io => {
    let waitlist = [];
    let connectedUsers = {};

    io.on('connection', socket => {
        console.log('Hooked up!', socket.id)
        if (socket.request.session.passport){
            socket.username = socket.request.session.passport.user.username
            connectedUsers[socket.request.session.passport.user.username] = socket.id;
            console.log('connected: ', connectedUsers)
        }
        socket.on('disconnect', function() {
            //remove from random waitlist
            removeFromWaitlist(socket.id);

            //if they were mid match, forfeit the game and null opponents
            socket.to(socket.opponent).emit('youWon', socket.id)
            if (io.sockets.connected[socket.opponent]){
                io.sockets.connected[socket.opponent].opponent = null;
            }

            //rescind challenge if one had been extended
            if (socket.challenge){
                console.log('rescending on disconnect: ', socket.challenge, socket.id)
                socket.to(connectedUsers[socket.challenge]).emit('challengeRescinded', socket.request.session.passport.user.username)
            }
            
            //remove from connectedUser object
            delete connectedUsers[socket.username];

        })
        socket.on('login', username => {
            socket.username = username;
            connectedUsers[username] = socket.id;
            console.log('logged in socket: ', socket.id, socket.username)
        })

        socket.on('challenge', challenge => {
            console.log('emitted challnge to ', challenge)
            if (connectedUsers[challenge]){
                //emit challenge
                io.to(connectedUsers[challenge]).emit('challenger', io.sockets.connected[socket.id].username)
                socket.challenge = challenge;
                
                //emit back to sender that it was sent
                io.to(socket.id).emit('challengeSent', challenge)
            } else {
                //emit back to sender if opponent not available
                io.to(socket.id).emit('opponentNotAvailable', 'Opponent not logged in')
            }
        })

        socket.on('challengeAccepted', opponent => {
            //first make sure the proposed opponent is connected
            if (connectedUsers[opponent]){
                //define opponents
                let playerOne = connectedUsers[opponent];
                let playerTwo = socket.id;
                io.sockets.connected[playerOne].opponent = playerTwo;
                io.sockets.connected[playerTwo].opponent = playerOne;
                
                //match them up
                io.to(playerOne).emit('matched', playerTwo);
                io.to(playerTwo).emit('matched', playerOne);
            }
        })

        socket.on('rescindChallenge', challenge => {
            console.log('the one t oresceind from: ', challenge)
            if (connectedUsers[challenge]){
                io.to(connectedUsers[challenge]).emit('challengeRescinded', io.sockets.connected[socket.id].username)
            }
        })

        socket.on('joinWaiting', () => {
            if (!waitlist.includes(socket.id)){
                waitlist.push(socket.id);
            }   
            console.log('waitlist:', waitlist);
            if (waitlist.length >= 2){
                let playerOne = waitlist.shift();
                let playerTwo = waitlist.shift();
                io.sockets.connected[playerOne].opponent = playerTwo;
                io.sockets.connected[playerTwo].opponent = playerOne;
                io.to(playerOne).emit('matched', playerTwo);
                io.to(playerTwo).emit('matched', playerOne);
            }
        })

        socket.on('leaveWaiting', () => {
            removeFromWaitlist(socket.id);
        })

        socket.on('sendMole', () => {
            socket.to(socket.opponent).emit('moleSent')
        })

        socket.on('youWon', () => {
            console.log('Game over');
            socket.to(socket.opponent).emit('youWon');
            if (io.sockets.connected[socket.opponent]) {
                io.sockets.connected[socket.opponent].opponent = null;
            }
            socket.opponent = null;        
        })
    })

    function removeFromWaitlist (socketId) {
        let socketPosition = waitlist.indexOf(socketId);
        if (socketPosition >= 0) {
            waitlist.splice(waitlist.indexOf(socketId), 1);
        }
    }
}