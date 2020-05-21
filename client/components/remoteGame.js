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
            },
            chat: [],
            message: '',
            clue: '',
            gameStatus: null,
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
            }else if (type === 'requests update'){
                copied.requests = roomData.requests; 
                copied.players = roomData.players;  
            }else if (type === 'players update') {
                console.log('players');
                copied.sockets = roomData;   
            }else if (type === 'clues') {
                console.log('clues: ', clues);
                copied.clues = roomData.clues;
                copied.guessesRemaining = roomData.guessesRemaining;
                copied.clueSubmitted = roomData.clueSubmitted;
            }else if(type === 'cover box'){
                console.log('cover box ', roomData);
                copied.words[Math.floor(roomData.boxNumber/5)][roomData.boxNumber%5].status = 'covered';
                copied.colorCode[Math.floor(roomData.boxNumber/5)][roomData.boxNumber%5] = roomData.color;
                copied.turn = roomData.turn;
                copied.guessesRemaining = roomData.guessesRemaining;
                copied.clueSubmitted = roomData.clueSubmitted;
            }else if (type === 'end turn') {
                copied.turn = roomData.turn;
                copied.guessesRemaining = roomData.guessesRemaining;
                copied.clueSubmitted = roomData.clueSubmitted;
            }else if (type === 'end game') {
                copied = roomData;
                console.log('game ended');
            }else if (type === 'start game'){
                if(socket.id === this.state.roomData.blueSpymaster.socket || socket.id === this.state.roomData.redSpymaster.socket){
                    for(let x=0; x<5; x++) {
                        for (let y=0; y<5; y++){
                            copied.words[x][y].status = 'revealed';
                        }
                    }
                }
                copied.colorCode = roomData.colorCode;
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
        this.endTurn = this.endTurn.bind(this);
    }

    componentDidMount() {
        socket.emit('entered room', this.state.params.gameRoom);
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
        if (this.state.roomData.clueSubmitted === true) {
            return;
        }
        if (this.state.number){
            //do some checking here
        }
        socket.emit('new clue', this.state.params.gameRoom, this.state.clue, this.state.number);
        this.setState({clue: '', number: ''});
        document.getElementById('clue').value = '';
        document.getElementById('number').value = '';
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
        if(this.state.roomData.words[Math.floor(boxNumber/5)][boxNumber%5].status === 'covered'){
            //toggling covered or revealed
            let copied = Object.assign({}, this.state.roomData);
            copied.words[Math.floor(boxNumber/5)][boxNumber%5].status = 'revealed';
            this.setState({roomData: copied});
        }else if(this.state.roomData.words[Math.floor(boxNumber/5)][boxNumber%5].status === 'revealed') {
            //toggling covered or revealed
            let copied = Object.assign({}, this.state.roomData);
            copied.words[Math.floor(boxNumber/5)][boxNumber%5].status = 'covered';
            this.setState({roomData: copied});
        }else if(this.state.roomData.sockets[socket.id].color === this.state.roomData.turn && (this.state.roomData.redSpymaster.socket != socket.id && this.state.roomData.blueSpymaster.socket != socket.id)) {
            //it's your turn and a clue has been submitted and you're not a spymaster
            if(window.confirm('Reveal ' + word + '?')) {
                //you're a guesser actually revealing the word
                socket.emit('cover box', boxNumber, this.state.params.gameRoom);
            }
        }
    }

    endTurn() {
        if(this.state.roomData.sockets[socket.id].color != this.state.roomData.turn){
            return;
        } else if(window.confirm('End ' + this.state.roomData.turn + '?')){
            socket.emit('end turn', this.state.params.gameRoom);
        }
    }

    render() {
        if (this.state.roomData.gameStatus === null) {
            return <div> Not welcomd here </div>;
        }
        let startStopText = this.state.roomData.gameStatus === 'active' ? 'End' : 'Start';

        let spymaster = this.state.roomData.redSpymaster.socket === socket.id || this.state.roomData.blueSpymaster.socket === socket.id;

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
                            return <div className={'chatMessage'} key={index}><span className={message.color}>{message.sender}: </span> {message.message}</div>
                        })}
                        </div>
                        <form id='chatForm' onSubmit={this.submitChat} autoComplete='off'>
                            <input type='text' id='chatInput' className='inline' onChange={this.changeMessage}></input>
                            <input type='submit' id='chatSubmit' className='inline' value='Enter'></input>
                        </form>
                        </div>
                    <div id='clueInterface'>
                        <div id='cluesTitle'><span className={this.state.roomData.turn}>{this.state.roomData.turn + ' turn'}</span> Guesses: {this.state.roomData.guessesRemaining || '(awaiting clue)'}</div>
                        <div id='clues'>
                            {this.state.roomData.clues.map((clue, index) => {
                                return <div className={'clue ' + clue.color} key={index}>
                                    {clue.clueWord + ' : ' + clue.number} 
                                </div>
                            })}
                        </div>
                        <div id='endTurnButton' onClick={this.endTurn}>
                            End Turn
                        </div>
                        <form id='newClue' onSubmit={this.submitClue}>
                            <input id='clue' type='text' placeholder='Clue Word' autoComplete='off' onChange={this.changeClue} disabled={!spymaster || this.state.roomData.turn != this.state.roomData.sockets[socket.id].color || this.state.roomData.clueSubmitted}></input>
                            <input id='number' type='text' maxLength='1' placeholder='0-9 or U' autoComplete='off' onChange={this.changeNumber} disabled={!spymaster || this.state.roomData.turn != this.state.roomData.sockets[socket.id].color || this.state.roomData.clueSubmitted}></input>
                            <input type='submit' value='Enter Clue' disabled={!spymaster || this.state.roomData.turn != this.state.roomData.sockets[socket.id].color || this.state.roomData.clueSubmitted}></input>
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
                            <div className={'background ' + this.state.roomData.colorCode[indexA][index]}></div>
                        </div>
                    })}
                    </div>
                })}
            </div>
            </div>
            
        )
    }
}