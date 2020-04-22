module.exports = io => {

    io.on('connection', socket => {
        console.log('Hooked up! ', socket.id);

        socket.on('disconnect', function() {
            console.log('rooms after discconnect: ', io.sockets.adapter.rooms);
            io.emit('member left', socket.id);
            //cancel all join requests
        })

        socket.on('create room', (newRoomName, userName) => {
            if(io.sockets.adapter.rooms[newRoomName]){
                io.to(`${socket.id}`).emit('room name already taken', newRoomName);
            } else {
                //****unjoin socket from all other rooms*****
                //console.log('my rooms: ', io.sockets.sockets.)
                socket.join(newRoomName);
                let color = userName.length %2 === 0 ? 'blue' : 'red';                
                io.sockets.sockets[socket.id].name = userName;
                io.sockets.sockets[socket.id].color = color;
                io.to(`${socket.id}`).emit('new room created', newRoomName);
                io.in(newRoomName).emit('new member', socket.id, [{name: userName, socket: socket.id, color: color, ready: false}])
            }
        })

        socket.on('join room', (roomToJoin, name) => {
            if(io.sockets.adapter.rooms[roomToJoin]) {
                io.in(roomToJoin).emit('trying to join', name, socket.id, roomToJoin);
            } else {
                io.to(`${socket.id}`).emit('room does not exist', roomToJoin)
            }
        })

        socket.on('cancel request', (roomToJoin) => {
            io.in(roomToJoin).emit('cancel request', socket.id);
        })

        socket.on('accepted', (name, requestingSocket, roomToJoin) => {
            //to check if the admitting socket is in the room
            if(io.sockets.adapter.rooms[roomToJoin].sockets[socket.id]){
                //unjoin socket from all other rooms
                io.sockets.sockets[requestingSocket].join(roomToJoin);
                io.sockets.sockets[requestingSocket].name = name;
                let color = name.length %2 === 0 ? 'blue' : 'red';
                io.sockets.sockets[requestingSocket].color = color;
                io.sockets.sockets[requestingSocket].ready = false;
                let players = [];
                Object.keys(io.sockets.adapter.rooms[roomToJoin].sockets).forEach(socket => {
                    console.log(io.sockets.sockets[socket].name)
                    players = players.concat({name: io.sockets.sockets[socket].name, socket: socket, color: io.sockets.sockets[socket].color, ready: io.sockets.sockets[socket].ready});
                });
                io.to(requestingSocket).emit('accepted', roomToJoin);
                io.in(roomToJoin).emit('new member', requestingSocket, players);  
            }
        })

        socket.on('rejoin', (room) => {
            if(io.sockets.adapter.rooms[roomToJoin].sockets[socket.id]){
                io.in(room).emit('new member', io.sockets.sockets[requestingSocket].name);
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

        socket.on('change color', (room) => {
            console.log('change color: ', socket.id);
            io.sockets.sockets[socket.id].color = io.sockets.sockets[socket.id].color === 'blue' ? 'red' : 'blue';
            io.in(room).emit('change color', socket.id, io.sockets.sockets[socket.id].color);
        })

        socket.on('change ready', (room, readyState) => {
            console.log('ready changsted');
            io.in(room).emit('change ready', socket.id, readyState);
        })

        socket.on('member left', (room) => {
            console.log(socket.id, ' left: ', room);
            if(!io.sockets.adapter.rooms[room]){
                return;
            } else if(io.sockets.adapter.rooms[room].sockets[socket.id]){
                io.in(room).emit('member left', socket.id);
            }
        })

        socket.on('get game data', (room) => {
            if(!io.sockets.adapter.rooms[room]){
                return;
            } else if(io.sockets.adapter.rooms[room].sockets[socket.id]){
                io.to(socket.id).emit('game data', 'some game data');
            } else {
                io.to(socket.id).emit('game data', 'you are not part of this game -> go backs');
            }
        })
    })
}