module.exports = io => {

    io.on('connection', socket => {
        console.log('Hooked up! ', socket.id);

        socket.on('disconnect', function() {
            io.emit('user disconnected');
            //cancel all join requests
            // remove admin status from rooms list
        })

        socket.on('createRoom', (newRoomName) => {
            if(io.sockets.adapter.rooms[newRoomName]){
                io.to(`${socket.id}`).emit('room name already taken', newRoomName);
            } else {
                socket.join(newRoomName);
                io.to(`${socket.id}`).emit('new room created', newRoomName);
            }
        })

        socket.on('joinRoom', (roomToJoin, name) => {
            if(io.sockets.adapter.rooms[roomToJoin]) {
                io.in(roomToJoin).emit('trying to join', name, socket.id, roomToJoin);
            } else {
                io.to(`${socket.id}`).emit('room does not exist', roomToJoin)
            }
        })

        socket.on('cancelRequest', (roomToJoin) => {
            io.in(roomToJoin).emit('cancel request', socket.id);
        })

        socket.on('accepted', (name, requestingSocket, roomToJoin) => {
            //to check if the admitting socket is in the room
            //console.log('sckets: ', io.sockets.sockets);
            if(io.sockets.adapter.rooms[roomToJoin].sockets[socket.id]) {
                io.sockets.sockets[requestingSocket].join(roomToJoin);
                io.sockets.sockets[requestingSocket].name = name;
                io.to(requestingSocket).emit('accepted', roomToJoin);
                io.in(roomToJoin).emit('new member', requestingSocket, name);  
            }
        })

        socket.on('denied', (requestingSocket, roomToJoin) => {
            //to check if the denying socket is in the room
            if(io.sockets.adapter.rooms[roomToJoin].sockets[socket.id]) {
                io.to(requestingSocket).emit('denied');
                io.in(roomToJoin).emit('member denied', requestingSocket);  
            }
        })

        socket.on('chat message', (message, room) => {
            console.log('sender name: ', io.sockets.sockets[socket.id].name, ' message: ', message);
            if(io.sockets.adapter.rooms[room].sockets[socket.id]){
                io.in(room).emit('new message', io.sockets.sockets[socket.id].name, message);
            }
        })

        socket.on('get game data', (roomName) => {
            //console.log('rooms: ', io.sockets.adapter.rooms);
            if (io.sockets.adapter.rooms[roomName].sockets[socket.id]){
                io.to(socket.id).emit('game data', 'some game data');
            } else {
                io.to(socket.id).emit('game data', 'you are not part of this game -> go backs');
            }
        })
    })
}