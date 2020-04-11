module.exports = io => {

    io.on('connection', socket => {
        console.log('Hooked up! ', socket.id);

        socket.on('disconnect', function() {
            io.emit('user disconnected');
            // remove admin status from rooms list
        })

        socket.on('showRooms', () => {
            console.log('rooms: ', io.sockets.adapter.rooms)
        })

        socket.on('createRoom', (newRoomName) => {
            if(io.sockets.adapter.rooms[newRoomName]){
                if(io.sockets.adapter.rooms.roomAdmins[newRoomName] == socket.id) {
                    io.to(`${socket.id}`).emit('new room created', newRoomName);
                } else {
                    io.to(`${socket.id}`).emit('room name already taken', newRoomName);
                }
            } else {
                if (!io.sockets.adapter.rooms.roomAdmins) {
                    io.sockets.adapter.rooms.roomAdmins = {[newRoomName]: socket.id}
                } else {
                    io.sockets.adapter.rooms.roomAdmins[newRoomName] = socket.id;
                }
                socket.join(newRoomName);
                io.to(`${socket.id}`).emit('new room created', newRoomName);
            }
        })

        socket.on('joinGame', (gameToJoin, name) => {
            console.log('socket trying to join ', 'rooms extant: ', io.sockets.adapter.rooms);
            if(io.sockets.adapter.rooms[gameToJoin]) {
                io.to(`${io.sockets.adapter.rooms.roomAdmins[gameToJoin]}`).emit('trying to join', name, socket.id);
            } else {
                io.to(`${socket.id}`).emit('room does not exist', gameToJoin)
            }
        })

        socket.on('denied', (requestingSocket) => {
            console.log('denied');
            io.to(requestingSocket).emit('denied');
        })
    })
}