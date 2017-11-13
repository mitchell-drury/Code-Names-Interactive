import io from 'socket.io-client'

function connectToSite (incrementMoles, setGameState) {
    const socket = io(window.location.origin)

    socket.on('connect', () => {
        console.log('Connected!, My Socket Id:', socket.id)
    })
    socket.on('disconnect', () => {
        socket.emit('leave', 'waiting');
        //also emit a winning to current opponent
    })
    socket.on('joinedwaiting', msg => {
        console.log(msg)
    })
    socket.on('leftwaiting', msg => {
        console.log(msg);
    })
    socket.on('moleSent', (msg) => {
        console.log('received mole')
        incrementMoles();
    })
    socket.on('matched', opponentId => {
        console.log('match made, opponentId:', opponentId);
        socket.opponent = opponentId;
        setGameState('active');
    })
    socket.on('lost', () => {
        setGameState('ended')
    })
    socket.on('won', () => {
        console.log('I won')
        socket.opponent = null;
        setGameState('won');
    })
    return socket;
}

function joinWaiting (socket) {
    socket.emit('join', 'waiting')
}

function leaveWaiting (socket) {
    socket.emit('leave', 'waiting')
}

function sendMole (socket) {
    console.log('sending mole to:', socket.opponent)
    socket.emit('sendMole', socket.opponent)
}

function wonGame (socket) {
    console.log('sending victory notice');
    socket.emit('won', socket.opponent);
    socket.opponent = null;
}

module.exports = {
    connectToSite,
    joinWaiting,
    leaveWaiting,
    sendMole,
    wonGame
}