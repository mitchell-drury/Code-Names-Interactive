module.exports = io => {

    let roomsData = {};
    let socketRooms = {};

    io.on('connection', socket => {
        console.log('Hooked up! ', socket.id);

        socket.on('disconnect', function() {
            if(socketRooms[socket.id]) {
                delete roomsData[socketRooms[socket.id]].sockets[socket.id];
                checkForEmptyRoom(socketRooms[socket.id]);
                io.in(socketRooms[socket.id]).emit('room data', roomsData[socketRooms[socket.id]]);
                delete socketRooms[socket.id];
            }

            console.log('socketRooms: ', socketRooms, 'roomsData: ', roomsData)

            //TODO - cancel all join requests
        })

        socket.on('create room', (newRoomName, userName) => {
            if(roomsData[newRoomName]){
                io.to(`${socket.id}`).emit('room name already taken', newRoomName);
            } else {
                let color = userName.length%2 === 0 ? 'blue' : 'red'  ;     
                roomsData[newRoomName] = {
                    sockets: {
                        [socket.id]: {
                            id: socket.id,
                            name: userName,
                            color: color,
                            ready: false,
                            spyMaster: false,
                            inRoom: true
                        }
                    },
                    requests: {},
                    words: {},
                    gameStatus: 'waiting'
                }

                //leave other room if previously in one
                if(socketRooms[socket.id]) {
                    delete roomsData[socketRooms[socket.id]].sockets[socket.id]
                    socket.leave(socketRooms[socket.id]);
                    checkForEmptyRoom(socketRooms[socket.id])
                }

                //join newly created room
                socketRooms[socket.id] = newRoomName;
                socket.join(newRoomName);
      
                io.to(`${socket.id}`).emit('new room created', newRoomName);
                io.in(newRoomName).emit('room data', roomsData[newRoomName]);
            }
        })

        socket.on('request to join', (roomToJoin, name) => {
            console.log('socket requesting to join');
            if(roomsData[roomToJoin]) {
                roomsData[roomToJoin].requests[socket.id] = {socket: socket.id, name: name}
                io.in(roomToJoin).emit('room data', roomsData[roomToJoin]);
            } else {
                io.to(`${socket.id}`).emit('room does not exist', roomToJoin);
            }
        })

        socket.on('cancel request', (roomToJoin) => {
            delete roomsData[roomToJoin].requests[socket.id];
            io.in(roomToJoin).emit('room data', roomsData[roomToJoin]);
        })

        socket.on('accepted', (name, requestingSocket, roomToJoin) => {
            if(roomsData[roomToJoin].sockets[socket.id]){
                //TODO - unjoin socket from all other rooms****
                if(socketRooms[requestingSocket]) {
                    console.log('unjoing from: ', socketRooms[requestingSocket], ' before joining: ', roomToJoin)
                    delete roomsData[socketRooms[requestingSocket]].sockets[socket.id];
                    checkForEmptyRoom(socketRooms[requestingSocket]);
                    io.sockets.sockets[requestingSocket].leave(socketRooms[requestingSocket]);
                    io.in(socketRooms[requestingSocket]).emit('room data', roomsData[socketRooms[requestingSocket]]);
                }
                io.sockets.sockets[requestingSocket].join(roomToJoin);
                let color = name.length %2 === 0 ? 'blue' : 'red';   
                delete roomsData[roomToJoin].requests[requestingSocket];
                roomsData[roomToJoin].sockets[requestingSocket] = {id: requestingSocket, name: name, color: color, ready: false, spyMaster: false, inRoom: true};
                socketRooms[requestingSocket] = roomToJoin;
                io.to(requestingSocket).emit('accepted'); 
            }
        })

        socket.on('denied', (requestingSocket, roomToJoin) => {
            if(roomsData[roomToJoin].sockets[socket.id]) {
                delete roomsData[roomToJoin].requests[requestingSocket];
                io.to(requestingSocket).emit('denied');
                io.in(roomToJoin).emit('room data', roomsData[roomToJoin]);  
            }
        })        

        socket.on('chat message', (message, room) => {
            console.log('sender name: ', roomsData[room].sockets[socket.id].name, ' message: ', message);
            if(roomsData[room].sockets[socket.id]){
                io.in(room).emit('new message', roomsData[room].sockets[socket.id].name, message, roomsData[room].sockets[socket.id].color);
            }
        })

        socket.on('change color', (room) => {
            console.log('change color: ', socket.id);
            roomsData[room].sockets[socket.id].color = roomsData[room].sockets[socket.id].color === 'blue' ? 'red' : 'blue';
            io.in(room).emit('room data', roomsData[room]);
        })

        socket.on('change ready', (room, readyState) => {
            console.log('ready changed');
            roomsData[room].sockets[socket.id].ready = readyState;
            let startGame = true;
            Object.keys(roomsData[room].sockets).forEach(socket => {
                if(!roomsData[room].sockets[socket].ready) {
                    startGame = false;
                }
            })
            roomsData[room].gameStatus = startGame ? 'ready to start' : 'waiting';
            io.in(room).emit('room data', roomsData[room]);
        })

        socket.on('left room', (room) => {
            console.log(socket.id, ' left: ', room);
            if(roomsData[room] && roomsData[room].sockets[socket.id]){
                roomsData[room].sockets[socket.id].inRoom = false;
                io.in(room).emit('room data', roomsData[room]);
            }
        })

        socket.on('get room data', (room) => {
            if(!roomsData[room] || !roomsData[room].sockets[socket.id]){
                io.to(socket.id).emit('room data', 
                    {sockets: {},
                    requests: {},
                    words: {},
                    gameStatus: 'not welcome'
                    });
            } else if(roomsData[room].sockets[socket.id]){
                roomsData[room].sockets[socket.id].inRoom = true;
                io.in(room).emit('room data', roomsData[room]);
            }
        })

        function checkForEmptyRoom(room) {
            if(Object.keys(roomsData[room].sockets).length < 1) {
                delete roomsData[room];
            }
        }
    })
}