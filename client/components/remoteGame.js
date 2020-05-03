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
                gameStatus: 'waiting'
            },
            chat: [],
            message: '',
            clue: '',
            number: '',
            params: QueryString.parse(location.search),
            gameData: {}
        }

        socket.on('room data', (roomData) => {
            console.log('room data: ', roomData);
            this.setState({roomData: roomData});
        })

        socket.on('new message', (sender, message, color) => {
            let newChat = [{sender: sender, message: message, color: color}].concat(this.state.chat)
            this.setState({chat: newChat});
        })

        socket.on('start game', () => {
            console.log('start game');
            //TODO - make start button available
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
    }

    componentDidMount() {
        socket.emit('get room data', this.state.params.gameRoom);
    }

    componentWillUnmount() {
        socket.off('new message');
        socket.off('room data');
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

    changeColor(){
        socket.emit('change color', this.state.params.gameRoom);
    }

    changeSpymaster(event) {
        console.log('checkbox event: ', event.target.checked);
        socket.emit('change spymaster', this.state.params.gameRoom, event.target.checked);
    }

    startGame() {
        if (this.state.roomData.gameStatus === 'waiting') {
            socket.emit('start game', this.state.params.gameRoom);
        }
    }

    render() {
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
                                return <div className='bluePlayer' key={index}><input type='checkbox' onChange={this.changeSpymaster} checked={isSpymaster} disabled={!isSpymaster && spymasterPresent}></input>{this.state.roomData.sockets[socketId].name}<span className='rightArrow' onClick={this.changeColor}>&larr;</span></div>
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
                   Start Game
                   </div>
                </div>
            </div>
            <div id='gameBoard'>
                {this.state.roomData.words.map((row, index) => {
                    return (<div className='row' key={index}>
                    {row.map((word, index) => {
                        return <div className={'box ' + word.status} key={index}>
                        <div className='word'>{word.word}</div>
                        </div>
                    })}
                    </div>)
                })}
            </div>
            </div>
            
        )
    }
}