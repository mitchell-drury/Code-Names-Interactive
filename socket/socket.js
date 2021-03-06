module.exports = io => {

    const wordBank = ["AFRICA","AGENT","AIR","ALIEN","ALPS","AMAZON","AMBULANCE","AMERICA","ANGEL","ANTARCTICA","APPLE","ARM","ATLANTIS","AUSTRALIA","AZTEC","BACK","BALL","BAND","BANK","BAR","BARK","BAT","BATTERY","BEACH","BEAR","BEAT","BED","BEIJING","BELL","BELT","BERLIN","BERMUDA","BERRY","BILL","BLOCK","BOARD","BOLT","BOMB","BOND","BOOM","BOOT","BOTTLE","BOW","BOX","BRIDGE","BRUSH","BUCK","BUFFALO","BUG","BUGLE","BUTTON","CALF","CANADA","CAP","CAPITAL","CAR","CARD","CARROT","CASINO","CAST","CAT","CELL","CENTAUR","CENTER","CHAIR","CHANGE","CHARGE","CHECK","CHEST","CHICK","CHINA","CHOCOLATE","CHURCH","CIRCLE","CLIFF","CLOAK","CLUB","CODE","COLD","COMIC","COMPOUND","CONCERT","CONDUCTOR","CONTRACT","COOK","COPPER","COTTON","COURT","COVER","CRANE","CRASH","CRICKET","CROSS","CROWN","CYCLE","CZECH","DANCE","DATE","DAY","DEATH","DECK","DEGREE","DIAMOND","DICE","DINOSAUR","DISEASE","DOCTOR","DOG","DRAFT","DRAGON","DRESS","DRILL","DROP","DUCK","DWARF","EAGLE","EGYPT","EMBASSY","ENGINE","ENGLAND","EUROPE","EYE","FACE","FAIR","FALL","FAN","FENCE","FIELD","FIGHTER","FIGURE","FILE","FILM","FIRE","FISH","FLUTE","FLY","FOOT","FORCE","FOREST","FORK","FRANCE","GAME","GAS","GENIUS","GERMANY","GHOST","GIANT","GLASS","GLOVE","GOLD","GRACE","GRASS","GREECE","GREEN","GROUND","HAM","HAND","HAWK","HEAD","HEART","HELICOPTER","HIMALAYAS","HOLE","HOLLYWOOD","HONEY","HOOD","HOOK","HORN","HORSE","HORSESHOE","HOSPITAL","HOTEL","ICE","ICE CREAM","INDIA","IRON","IVORY","JACK","JAM","JET","JUPITER","KANGAROO","KETCHUP","KEY","KID","KING","KIWI","KNIFE","KNIGHT","LAB","LAP","LASER","LAWYER","LEAD","LEMON","LEPRECHAUN","LIFE","LIGHT","LIMOUSINE","LINE","LINK","LION","LITTER","LOCH NESS","LOCK","LOG","LONDON","LUCK","MAIL","MAMMOTH","MAPLE","MARBLE","MARCH","MASS","MATCH","MERCURY","MEXICO","MICROSCOPE","MILLIONAIRE","MINE","MINT","MISSILE","MODEL","MOLE","MOON","MOSCOW","MOUNT","MOUSE","MOUTH","MUG","NAIL","NEEDLE","NET","NEW YORK","NIGHT","NINJA","NOTE","NOVEL","NURSE","NUT","OCTOPUS","OIL","OLIVE","OLYMPUS","OPERA","ORANGE","ORGAN","PALM","PAN","PANTS","PAPER","PARACHUTE","PARK","PART","PASS","PASTE","PENGUIN","PHOENIX","PIANO","PIE","PILOT","PIN","PIPE","PIRATE","PISTOL","PIT","PITCH","PLANE","PLASTIC","PLATE","PLATYPUS","PLAY","PLOT","POINT","POISON","POLE","POLICE","POOL","PORT","POST","POUND","PRESS","PRINCESS","PUMPKIN","PUPIL","PYRAMID","QUEEN","RABBIT","RACKET","RAY","REVOLUTION","RING","ROBIN","ROBOT","ROCK","ROME","ROOT","ROSE","ROULETTE","ROUND","ROW","RULER","SATELLITE","SATURN","SCALE","SCHOOL","SCIENTIST","SCORPION","SCREEN","SCUBA DIVER","SEAL","SERVER","SHADOW","SHAKESPEARE","SHARK","SHIP","SHOE","SHOP","SHOT","SINK","SKYSCRAPER","SLIP","SLUG","SMUGGLER","SNOW","SNOWMAN","SOCK","SOLDIER","SOUL","SOUND","SPACE","SPELL","SPIDER","SPIKE","SPINE","SPOT","SPRING","SPY","SQUARE","STADIUM","STAFF","STAR","STATE","STICK","STOCK","STRAW","STREAM","STRIKE","STRING","SUB","SUIT","SUPERHERO","SWING","SWITCH","TABLE","TABLET","TAG","TAIL","TAP","TEACHER","TELESCOPE","TEMPLE","THEATER","THIEF","THUMB","TICK","TIE","TIME","TOKYO","TOOTH","TORCH","TOWER","TRACK","TRAIN","TRIANGLE","TRIP","TRUNK","TUBE","TURKEY","UNDERTAKER","UNICORN","VACUUM","VAN","VET","WAKE","WALL","WAR","WASHER","WASHINGTON","WATCH","WATER","WAVE","WEB","WELL","WHALE","WHIP","WIND","WITCH","WORM","YARD"];

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
                            inRoom: true
                        }
                    },
                    redSpymaster: {socket: null},
                    blueSpymaster: {socket: null},
                    requests: {},
                    words: [
                        [
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'}
                        ],
                        [
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'}
                        ],
                        [
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'}
                        ],
                        [
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'}
                        ],
                        [
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'},
                            {word: '-', status: 'hidden', color: 'beige'}
                        ]
                    ],
                    colorCode: [
                        ['beige', 'beige', 'beige', 'beige', 'beige'],
                        ['beige', 'beige', 'beige', 'beige', 'beige'],
                        ['beige', 'beige', 'beige', 'beige', 'beige'],
                        ['beige', 'beige', 'beige', 'beige', 'beige'],
                        ['beige', 'beige', 'beige', 'beige', 'beige']
                    ],
                    clues: [],
                    clueSubmitted: null,
                    guessesRemaining: 0,
                    gameStatus: 'waiting',
                    startingColor: null,
                    turn: null
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
            }
        })

        socket.on('request to join', (roomToJoin, name) => {
            console.log('socket requesting to join');
            if(roomsData[roomToJoin].gameStatus === 'active') {
                io.to(`${socket.id}`).emit('game in progress', roomToJoin);
            }else if(roomsData[roomToJoin]) {
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
                //TODO - unjoin socket from all other rooms
                if(socketRooms[requestingSocket]) {
                    console.log('unjoining from: ', socketRooms[requestingSocket], ' before joining: ', roomToJoin)
                    delete roomsData[socketRooms[requestingSocket]].sockets[socket.id];
                    checkForEmptyRoom(socketRooms[requestingSocket]);
                    io.sockets.sockets[requestingSocket].leave(socketRooms[requestingSocket]);
                    io.in(socketRooms[requestingSocket]).emit('room data', roomsData[socketRooms[requestingSocket]]);
                }
                io.sockets.sockets[requestingSocket].join(roomToJoin);
                let color = name.length %2 === 0 ? 'blue' : 'red';   
                delete roomsData[roomToJoin].requests[requestingSocket];
                roomsData[roomToJoin].sockets[requestingSocket] = {id: requestingSocket, name: name, color: color, ready: false, inRoom: true};
                socketRooms[requestingSocket] = roomToJoin;
                io.to(requestingSocket).emit('accepted'); 
            }
            io.in(roomToJoin).emit('room data', {requests: roomsData[roomToJoin].requests, sockets: roomsData[roomToJoin].sockets}, 'requests update');
            roomsData[roomToJoin].gameStatus = checkReadyStatus(roomToJoin);
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

        socket.on('new clue', (room, clue, number) => {
            console.log(roomsData, 'new clue for: ', room, ' ', clue, ' ', number);
            if(roomsData[room].clueSubmitted) {
                return;
            }
            roomsData[room].clues.push({'clueWord': clue, 'number': number, 'color': roomsData[room].sockets[socket.id].color});
            if(number === 'U' || number === 'u' || number === '0'){
                roomsData[room].guessesRemaining = 9;
            }else {
                roomsData[room].guessesRemaining = parseInt(number) + 1;
            }
            roomsData[room].clueSubmitted = true;
            io.in(room).emit('room data', {clues: roomsData[room].clues, guessesRemaining: roomsData[room].guessesRemaining, clueSubmitted: true}, 'clues');
        })

        socket.on('change color', (room) => {
            if(roomsData[room].gameStatus === 'active') {
                console.log('cannot change color during active game');
                return;
            }
            console.log('change color: ', socket.id);
            if (roomsData[room].redSpymaster.socket === socket.id) {
                roomsData[room].redSpymaster.socket = null;
            }
            if (roomsData[room].blueSpymaster.socket === socket.id) {
                roomsData[room].blueSpymaster.socket = null;
            }
            roomsData[room].sockets[socket.id].color = roomsData[room].sockets[socket.id].color === 'blue' ? 'red' : 'blue';
            roomsData[room].gameStatus = checkReadyStatus(room);
            io.in(room).emit('room data', roomsData[room], 'change color');
        })

        socket.on('change spymaster', (room, spymasterStatus) => {
            if(roomsData[room].gameStatus === 'active') {
                console.log('cannot change spymaster during active game');
                return;
            }
            console.log('spymaster changed');
            let color = roomsData[room].sockets[socket.id].color;
            if (spymasterStatus) {
                if (color == 'red'){
                    roomsData[room].redSpymaster = {socket: socket.id};
                } else {
                    roomsData[room].blueSpymaster = {socket: socket.id};
                }
            } else {
                if (color == 'red'){
                    roomsData[room].redSpymaster.socket = null;
                } else {
                    roomsData[room].blueSpymaster.socket = null;
                }
            }
            roomsData[room].gameStatus = checkReadyStatus(room);
            io.in(room).emit('room data', roomsData[room], 'change spymaster');
        })

        socket.on('left room', (room) => {
            //don't remove the socket, so that they can go back into room if they don't join another one
            console.log(socket.id, ' left: ', room);
            if(roomsData[room] && roomsData[room].sockets[socket.id]){
                roomsData[room].sockets[socket.id].inRoom = false;
                io.in(room).emit('room data', roomsData[room], 'left room');
                io.in(room).emit('new message', '', roomsData[room].sockets[socket.id].name + ' left the room', 'beige');
            }
        })

        socket.on('entered room', (room) => {
            console.log('room entered: ', room);
            if(roomsData[room]) {
                if(roomsData[room].sockets[socket.id]) {
                    roomsData[room].sockets[socket.id].inRoom = true;
                    io.in(room).emit('room data', (roomsData[room].sockets), 'players update');
                    io.in(room).emit('new message', '', roomsData[room].sockets[socket.id].name + ' entered the room');
                }
            }
        })

        socket.on('start game', (room) => {
            console.log('starting game');
            let startingColor;
            if(countPlayers('blue', room) === 0){
                startingColor = 'red';
            }else if (countPlayers('red', room) === 0) {
                startingColor = 'blue';
            }else {
                startingColor = pickRedOrBlue();
            }
            roomsData[room].turn = startingColor;
            roomsData[room].clues = [];
            roomsData[room].clueSubmitted = null;
            setAllSpacesBeige(room);
            setAllSpacesHidden(room);
            let secondColor = startingColor === 'blue' ? 'red' : 'blue';

            // place words
            let wordsAvailable = wordBank.slice();
            for(x=0; x<25; x++) {
                wordsAvailableIndex = Math.floor(Math.random()*wordsAvailable.length);
                roomsData[room].words[Math.floor(x/5)][x%5].word = wordsAvailable[wordsAvailableIndex];
                wordsAvailable.splice(wordsAvailableIndex, 1);
            }

            //set game status, starting color, words
            roomsData[room].gameStatus = 'active';
            roomsData[room].startingColor = startingColor;
            roomsData[room].turn = startingColor;
            
            //send just words without colorCode to everyone
            io.in(room).emit('room data', roomsData[room]);

            //set 9 starting color
            let gridSpaces = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
            let gridIndex;
            for(x=0; x<9; x++) {
                gridIndex = Math.floor(Math.random()*gridSpaces.length);
                gridSpace = gridSpaces[gridIndex];
                roomsData[room].colorCode[Math.floor(gridSpace/5)][gridSpace%5] = startingColor;
                gridSpaces.splice(gridIndex, 1);
            }

            //set 8 second color
            for(x=0; x<8; x++) {
                gridIndex = Math.floor(Math.random()*gridSpaces.length);
                gridSpace = gridSpaces[gridIndex];
                roomsData[room].colorCode[Math.floor(gridSpace/5)][gridSpace%5] = secondColor;
                gridSpaces.splice(gridIndex, 1);
            }
            //set 1 black spot
            gridIndex = Math.floor(Math.random()*gridSpaces.length);
            gridSpace = gridSpaces[gridIndex];
            roomsData[room].colorCode[Math.floor(gridSpace/5)][gridSpace%5] = 'black';
            gridSpaces.splice(gridIndex, 1);
            
            //set 7 civilians
            for(x=0; x<7; x++) {
                gridIndex = Math.floor(Math.random()*gridSpaces.length);
                gridSpace = gridSpaces[gridIndex];
                roomsData[room].colorCode[Math.floor(gridSpace/5)][gridSpace%5] = 'beige';
                gridSpaces.splice(gridIndex, 1);
            }

            //send words with colorCode info to spy masters
            io.to(roomsData[room].blueSpymaster.socket).emit('room data', roomsData[room], 'start game');
            io.to(roomsData[room].redSpymaster.socket).emit('room data', roomsData[room], 'start game');

            io.in(room).emit('new message', '', 'Game started', 'beige')
        })

        socket.on('cover box', (boxNumber, room) => {
            console.log('cover box: ', boxNumber, room);
            if (roomsData[room].guessesRemaining < 1) {
                // do more checking
                return;
            }
            roomsData[room].words[Math.floor(boxNumber/5)][boxNumber%5].status = 'covered';
            io.in(room).emit('new message', '', roomsData[room].sockets[socket.id].name + ' guessed ' + roomsData[room].words[Math.floor(boxNumber/5)][boxNumber%5].word, 'beige');
            
            if(roomsData[room].colorCode[Math.floor(boxNumber/5)][boxNumber%5] === 'black'){
                endGame(room);
                io.in(room).emit('room data', roomsData[room], 'end game');
                io.in(room).emit('new message', '',  roomsData[room].turn + ' loses for guessing the assassin' , 'beige');
            }else {
                if(roomsData[room].colorCode[Math.floor(boxNumber/5)][boxNumber%5] != roomsData[room].turn){
                    //incorrect guess ends turn
                    io.in(room).emit('new message', '', roomsData[room].turn + ' team guessed incorrectly');
                    endTurn(room);
                }else {
                    if(roomsData[room].guessesRemaining === 1) {
                        io.in(room).emit('new message', '', roomsData[room].turn + ' team out of guesses');
                        endTurn(room);
                    }else {
                        roomsData[room].guessesRemaining = roomsData[room].guessesRemaining - 1;
                    }
                }                    
                let boxInfo = {boxNumber: boxNumber, color: roomsData[room].colorCode[Math.floor(boxNumber/5)][boxNumber%5], guessesRemaining: roomsData[room].guessesRemaining, turn: roomsData[room].turn, clueSubmitted: roomsData[room].clueSubmitted};
                io.in(room).emit('room data', boxInfo, 'cover box');
            }   
        })

        socket.on('end turn', (room) => {
            if(roomsData[room].sockets[socket.id].color === roomsData[room].turn && socket.id != roomsData[room].redSpymaster.socket && socket.id != roomsData[room].blueSpymaster.socket) {
                io.in(room).emit('new message', '', roomsData[room].turn + ' ended their turn');                
                endTurn(room);
                io.in(room).emit('room data', {guessesRemaining: roomsData[room].guessesRemaining, turn: roomsData[room].turn, clueSubmitted:roomsData[room].clueSubmitted}, 'end turn');
            }
        })

        socket.on('end game', (room) => {
            endGame(room);
            io.in(room).emit('room data', roomsData[room], 'end game');
            io.in(room).emit('new message', '', roomsData[room].sockets[socket.id].name + ' ended the game', 'beige');
        })

        socket.on('get room data', (room) => {
            if(!roomsData[room] || !roomsData[room].sockets[socket.id]){
                io.to(socket.id).emit('room data', 
                    {sockets: {},
                    requests: {},
                    words: {},
                    gameStatus: null
                });
            }else if (roomsData[room].redSpymaster.socket === socket.id || roomsData[room].blueSpymaster.socket === socket.id ) {
                //send all data to spymaster
                roomsData[room].sockets[socket.id].inRoom = true;
                io.to(socket.id).emit('room data', roomsData[room]);

            }else {
                //only send colorCodes for words that have status covered
                let copiedRoomData = Object.assign({}, roomsData[room]);
                for(let x=0; x<5; x++) {
                    for(let y=0; y<5; y++) {
                        if(roomsData[room].words[x][y].status === 'covered'){
                            copiedRoomData.colorCode[x][y] = roomsData[room].colorCode[x][y];
                        } else {
                            copiedRoomData.colorCode[x][y] = 'beige';
                        }
                    }
                }
                io.to(socket.id).emit('room data', copiedRoomData);
            }
        })

        function checkForEmptyRoom(room) {
            if(Object.keys(roomsData[room].sockets).length < 1) {
                delete roomsData[room];
            }
        }

        function checkReadyStatus(room) {
            let redPlayers = 0;
            let bluePlayers = 0;
            Object.keys(roomsData[room].sockets).forEach(socket => {
                if(roomsData[room].sockets[socket].color === 'blue') {
                    bluePlayers += 1;
                }else {
                    redPlayers += 1;
                }
            })

            if(redPlayers){
                if(!roomsData[room].redSpymaster.socket){
                    return 'waiting';
                }
            }
            if(bluePlayers){
                if(!roomsData[room].blueSpymaster.socket){
                    return 'waiting';
                }
            }

            return 'ready';
        }

        function countPlayers(color, room){
            let count = 0;
            Object.keys(roomsData[room].sockets).forEach(socket => {
                if(roomsData[room].sockets[socket].color === color){
                    count += 1;
                }
            })
            return count;
        }

        function pickRedOrBlue(){
            if (Math.round(Math.random()) == 0){
                return "red";
            } else{
                return "blue";
            }
        }

        function setAllSpacesBeige(room) {
            for (let x=0; x<5; x++){
                for (let y=0; y<5; y++) {
                    roomsData[room].words[x][y].status = 'hidden';
                }
            }
        }

        function setAllSpacesHidden(room) {
            for (let x=0; x<5; x++){
                for (let y=0; y<5; y++) {
                    roomsData[room].colorCode[x][y] = 'beige';
                }
            }
        }

        function endTurn(room) {
            roomsData[room].guessesRemaining = 0;
            roomsData[room].clueSubmitted = false;

            let opposingColor = roomsData[room].turn === 'blue' ? 'red' : 'blue';
            if(countPlayers(opposingColor, room) === 0){
                //if no opposing team, same team goes again
                return;
            }else {  
                //otherwise switch team turn          
                roomsData[room].turn = roomsData[room].turn === 'blue' ? 'red' : 'blue';
            }
        }

        function endGame(room) {
            roomsData[room].redSpymaster.socket = null;
            roomsData[room].blueSpymaster.socket = null;
            roomsData[room].gameStatus = 'waiting';
            roomsData[room].guessesRemaining = 0;
            roomsData[room].turn = null;
            for(let x=0; x<5; x++) {
                for (let y=0; y<5; y++){
                    roomsData[room].words[x][y].status = 'revealed';
                }
            }
        }
    })
}