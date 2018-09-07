module.exports = io => {
    let waitlist = [];

    io.on('connection', socket => {
        console.log('Hooked up!', socket.id)
        socket.on('disconnect', function() {
            console.log('My severed socket: ' , socket.id)
            socket.to(socket.opponent).emit('won', socket.id)
            if (io.sockets.connected[socket.opponent]) {
                io.sockets.connected[socket.opponent].opponent = null;
            }
            socket.opponent = null;
        })

        socket.on('join', room => {
            if (room === 'waiting' && !waitlist.includes(socket.id)){
                waitlist.push(socket.id);
            }   
            console.log('waitlist:', waitlist);
            socket.join(room); 
            socket.in(room).emit('joined' + room, 'Hey . . .')
            if (waitlist.length === 2){
                while (waitlist.length >= 2){
                    let playerOne = waitlist.shift();
                    let playerTwo = waitlist.shift();
                    io.sockets.connected[playerOne].opponent = playerTwo;
                    io.sockets.connected[playerTwo].opponent = playerOne;
                    console.log('matched socket ', io.sockets.connected[playerOne]);
                    io.to(playerOne).emit('matched', playerTwo);
                    io.to(playerTwo).emit('matched', playerOne);
                }
            }
        })

        socket.on('leave', room => {
            socket.leave(room);
            if (waitlist.includes(socket.id)) {
                removeFromWaitlist(socket.id);
            }
            console.log('the leaving socket: ', socket.id)
            console.log('someone left, still reaming:', waitlist);
            socket.to(room).emit('left' + room, 'Bye . . .')
        })

        socket.on('sendMole', () => {
            socket.to(socket.opponent).emit('moleSent')
        })

        socket.on('won', () => {
            console.log('Game over');
            socket.to(socket.opponent).emit('won');
            if (io.sockets.connected[socket.opponent]) {
                io.sockets.connected[socket.opponent].opponent = null;
            }
            socket.opponent = null;        
        })
    });

    function removeFromWaitlist (socketId) {
        waitlist.splice(waitlist.indexOf(socketId), 1);
    }

    const waiting = io.of('/waiting');
}