module.exports = io => {
    let waitlist = [];

    io.on('connection', socket => {
        console.log('Hooked up!', socket.id)
        socket.on('disconnect', function() {
            console.log('Severed the line. . .')
        })

        socket.on('join', room => {
            if (room === 'waiting' && !waitlist.includes(socket.id)){
                waitlist.push(socket.id);
            }   
            console.log(waitlist);
            socket.join(room); 
            socket.in(room).emit('joined' + room, 'Hey . . .')
            if (waitlist.length === 2){
                while (waitlist.length >= 2){
                    let playerOne = waitlist.shift();
                    let playerTwo = waitlist.shift();
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
            console.log(waitlist);
            socket.to(room).emit('left' + room, 'Bye . . .')
        })

        socket.on('sendMole', opponent => {
            socket.to(opponent).emit('moleSent')
        })

        socket.on('won', opponent => {
            socket.to(opponent).emit('won');
        })
    });

    function removeFromWaitlist (socketId) {
        waitlist.splice(waitlist.indexOf(socketId), 1);
    }

    const waiting = io.of('/waiting');
}