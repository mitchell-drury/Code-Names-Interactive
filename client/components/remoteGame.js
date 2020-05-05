import React, {Component} from 'react';
import {socket} from './clientRoutes.js';
import RequestToJoin from './requestToJoin.js';
import * as QueryString from 'query-string';

export default class RemoteGame extends Component {
    constructor (props) {
        super (props);

        this.state = {
            roomData: {
                sockets: {},
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
                clues: [],
                gameStatus: 'waiting',
                startingColor: null
            },
            chat: [],
            message: '',
            clue: '',
            number: '',
            params: QueryString.parse(location.search),
            gameData: {}
        }

        socket.on('room data', (roomData, type) => {
            console.log('room data: ', roomData, ' type: ', type);  
            let copied = Object.assign({}, this.state.roomData); 
            if(type === 'change color') {
                copied.sockets = roomData.sockets;
                copied.redSpymaster = roomData.redSpymaster;
                copied.blueSpymaster = roomData.blueSpymaster;
                copied.gameStatus = roomData.gameStatus;
            }else if(type === 'change spymaster') {
                copied.redSpymaster = roomData.redSpymaster;
                copied.blueSpymaster = roomData.blueSpymaster;
                copied.gameStatus = roomData.gameStatus;
            }else if(type === 'cover box'){
                console.log('cover box ', roomData);
                let copiedRoomData = Object.assign({}, this.state.roomData);
                copiedRoomData.words[Math.floor(roomData/5)][roomData%5].status = 'covered';
                this.setState({roomData: copiedRoomData})
            }else if (type === 'end game') {
                //TODO ---- set state
                console.log('game ended');
            }else {
                //update everything with current data from server
                copied = roomData;
            }
            this.setState({roomData: copied});
        })

        socket.on('new message', (sender, message, color) => {
            let newChat = [{sender: sender, message: message, color: color}].concat(this.state.chat)
            this.setState({chat: newChat});
        })

        socket.on('start game', () => {
            console.log('start game');
            //if you're the spymaster, set all to revealed at outset
            if(socket.id === this.state.roomData.blueSpymaster.socket || socket.id === this.state.roomData.redSpymaster.socket) {
                let copiedRoomData = Object.assign({}, this.state.roomData);
                for(let x=0; x<5; x++) {
                    for (let y=0; y<5; y++){
                        copiedRoomData.words[x][y].status = 'revealed';
                    }
                }
                this.setState({roomData: copiedRoomData});
            }
            //TODO - chnage start button to stop
        })

        this.acceptRequest = this.acceptRequest.bind(this);
        this.denyRequest = this.denyRequest.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.submitChat = this.submitChat.bind(this);
        this.changeClue = this.changeClue.bind(this);
        this.changeNumber = this.changeNumber.bind(this);
        this.submitClue = this.submitClue.bind(this);
        this.changeColor = this.changeColor.bind(this);
        this.changeSpymaster = this.changeSpymaster.bind(this);
        this.startGame = this.startGame.bind(this);
        this.boxClick = this.boxClick.bind(this);
    }

    componentDidMount() {
        socket.emit('get room data', this.state.params.gameRoom);
    }

    componentWillUnmount() {
        socket.off('new message');
        socket.off('room data');
        socket.off('start game');
        socket.emit('left room', this.state.params.gameRoom);
    }

    acceptRequest(request) {
        socket.emit('accepted', request.name, request.socket, this.state.params.gameRoom);
    }

    denyRequest(request) {
        socket.emit('denied', request.socket, this.state.params.gameRoom);
    }

    changeMessage(event) {
        this.setState({message: event.target.value});
    }

    submitChat(event) {
        event.preventDefault();
        document.getElementById('chatInput').value = '';
        socket.emit('chat message', this.state.message, this.state.params.gameRoom);
    }

    changeClue(event) {
        this.setState({clue: event.target.value});
    }

    changeNumber(event) {
        this.setState({number: event.target.value});
    }

    submitClue(event) {
        event.preventDefault();
        socket.emit('new clue', this.state.params.gameRoom, this.state.clue, this.state.number);
    }

    changeColor() {
        socket.emit('change color', this.state.params.gameRoom);
    }

    changeSpymaster(event) {
        console.log('checkbox event: ', event.target.checked);
        socket.emit('change spymaster', this.state.params.gameRoom, event.target.checked);
    }

    startGame() {
        if(this.state.roomData.gameStatus === 'ready') {
            socket.emit('start game', this.state.params.gameRoom);
        } else if(this.state.roomData.gameStatus === 'active') {
            if(confirm('Are you you want to end the game?')) {
                socket.emit('end game', this.state.params.gameRoom);
            }
        }
    }

    boxClick(boxNumber, word) {
        console.log(boxNumber);
        if(socket.id === this.state.roomData.redSpymaster.socket || socket.id === this.state.roomData.blueSpymaster.socket) {
            //the spymaster just toggling between covered and revealed
            let copiedRoomData = Object.assign({}, this.state.roomData);

            this.setState({roomData: copiedRoomData});
        }else if(window.confirm('Reveal ' + word + '?')) {
            //you're a guesser actually revelaing the word
            socket.emit('cover box', boxNumber, this.state.params.gameRoom);
        }
    }

    render() {
        let startStopText = this.state.roomData.gameStatus === 'active' ? 'End' : 'Start';

        return (
            <div id='remoteGame'>
            <div id='topBar'>
                <div id='requests'>
                    <div id='requestTitle'>
                        Requests To Join:
                    </div>
                    <div id='requestList'>
                        {Object.keys(this.state.roomData.requests).map((request, index) => {
                            return <RequestToJoin key={index} acceptRequest={this.acceptRequest} denyRequest={this.denyRequest} request={this.state.roomData.requests[request]}/>
                        })}
                    </div>
                </div>
                <div id='chat'>
                    <div id='dialogue'>
                        <div id='roomName'>
                            Room: {this.state.params.gameRoom}
                        </div>
                        <div id='chatMessages'>
                        {this.state.chat.map((message, index) => {
                            return <div className={'chatMessage ' + message.color} key={index}>{message.sender}: {message.message}</div>
                        })}
                        </div>
                        <form id='chatForm' onSubmit={this.submitChat}>
                            <input type='text' id='chatInput' className='inline' onChange={this.changeMessage}></input>
                            <input type='submit' id='chatSubmit' className='inline'></input>
                        </form>
                        </div>
                    <div id='clueInterface'>
                        <div id='cluesTitle'>Clues</div>
                        <div id='clues'>
                            {this.state.roomData.clues.map(clue => {
                                return <div className='clue'>

                                </div>
                            })}
                        </div>
                        <form id='newClue' onSubmit={this.submitClue}>
                            <input type='text' placeholder='clue word' onChange={this.changeClue}></input>
                            <input type='text' placeholder='number' onChange={this.changeNumber}></input>
                            <input type='submit'></input>
                        </form>
                    </div>
                </div>
                <div id='players'>
                    <div id='playersTitle'>
                        Players
                    </div>
                    <div id='playersList'>
                        <div id='redPlayers'>
                        {Object.keys(this.state.roomData.sockets).filter(socketId => this.state.roomData.sockets[socketId].color == 'red' && this.state.roomData.sockets[socketId].inRoom).map((socketId, index) => {
                            let isSpymaster = socketId === this.state.roomData.redSpymaster.socket;
                            let spymasterPresent = this.state.roomData.redSpymaster.socket;
                            
                            if (socketId === socket.id) {
                                return <div className='redPlayer' key={index}><input type='checkbox' onChange={this.changeSpymaster} checked={isSpymaster} disabled={!isSpymaster && spymasterPresent}></input>{this.state.roomData.sockets[socketId].name}<span className='rightArrow' onClick={this.changeColor}>&rarr;</span></div>
                            } else {
                                if (socketId === this.state.roomData.redSpymaster.socket) {
                                    return <div className='redPlayer' key={index}>
                                    &#9745;{this.state.roomData.sockets[socketId].name}
                                    </div>
                                } else {
                                    return <div className='redPlayer' key={index}>
                                    {this.state.roomData.sockets[socketId].name}
                                    </div>
                                }
                            }
                            }
                        )}
                        </div>
                        <div id='bluePlayers'>
                        {Object.keys(this.state.roomData.sockets).filter(socketId => this.state.roomData.sockets[socketId].color == 'blue' && this.state.roomData.sockets[socketId].inRoom).map((socketId, index) => {
                            let isSpymaster = socketId === this.state.roomData.blueSpymaster.socket;
                            let spymasterPresent = this.state.roomData.blueSpymaster.socket;
                            
                            if (socketId === socket.id) {
                                return <div className='bluePlayer' key={index}><span className='rightArrow' onClick={this.changeColor}>&larr;</span>{this.state.roomData.sockets[socketId].name}<input type='checkbox' onChange={this.changeSpymaster} checked={isSpymaster} disabled={!isSpymaster && spymasterPresent}></input></div>
                            } else {
                                if (socketId === this.state.roomData.blueSpymaster.socket) {
                                    return <div className='bluePlayer' key={index}>
                                    &#9745;{this.state.roomData.sockets[socketId].name}
                                    </div>
                                } else {
                                    return <div className='bluePlayer' key={index}>
                                    {this.state.roomData.sockets[socketId].name}
                                    </div>
                                }
                            }
                            }
                        )}
                        </div>
                    </div>
                    <div id='startButton' className={this.state.roomData.gameStatus} onClick={this.startGame}>
                    {startStopText}
                    </div>
                </div>
            </div>
            <div id='gameBoard'>
                {this.state.roomData.words.map((row, indexA) => {
                    return <div className='row' key={indexA}>
                    {row.map((word, index) => {
                        let boxNumber = indexA*5 + index;
                        return <div className={'box ' + word.status} onClick={this.boxClick.bind(null, boxNumber, word.word)} key={index}>
                            <div className='word'>{word.word}</div>
                            <div className={'background ' + word.color}></div>
                        </div>
                    })}
                    </div>
                })}
            </div>
            </div>
            
        )
    }
}