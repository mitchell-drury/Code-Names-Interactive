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
                requests: {},
                words: {},
                gameStatus: 'waiting'
            },
            chat: [],
            message: '',
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
        this.changeColor = this.changeColor.bind(this);
        this.changeReady = this.changeReady.bind(this);
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

    changeColor(){
        socket.emit('change color', this.state.params.gameRoom);
    }

    changeReady(event) {
        console.log('checkbox event: ', event.target.checked);
        socket.emit('change ready', this.state.params.gameRoom, event.target.checked);
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
                <div id='players'>
                    <div id='playersTitle'>
                        Players:
                    </div>
                    <div id='playersList'>
                        <div id='redPlayers'>
                        {Object.keys(this.state.roomData.sockets).filter(socketId => this.state.roomData.sockets[socketId].color == 'red' && this.state.roomData.sockets[socketId].inRoom).map((socketId, index) => {
                            if(socketId === socket.id){
                                return <div className='redPlayer' key={index}><input type='checkbox' onChange={this.changeReady} checked={this.state.roomData.sockets[socketId].ready}></input>{this.state.roomData.sockets[socketId].name}<span className='rightArrow' onClick={this.changeColor}>&rarr;</span></div>
                            }else {
                                if(!this.state.roomData.sockets[socketId].ready){
                                    return <div className='redPlayer' key={index}>{this.state.roomData.sockets[socketId].name}</div>
                                }else {
                                    return <div className='redPlayer' key={index}>&#9745;{this.state.roomData.sockets[socketId].name}</div>
                                }
                            }
                        })}
                        </div>
                        <div id='bluePlayers'>
                        {Object.keys(this.state.roomData.sockets).filter(socketId => this.state.roomData.sockets[socketId].color == 'blue' && this.state.roomData.sockets[socketId].inRoom).map((socketId, index) => {
                            console.log('socketId: ', socketId)
                            if(socketId === socket.id){
                                return <div className='bluePlayer' key={index}><span className='leftArrow' onClick={this.changeColor}>&larr;</span>{this.state.roomData.sockets[socketId].name}<input type='checkbox' onChange={this.changeReady} checked={this.state.roomData.sockets[socketId].ready}></input></div>
                            }else {
                                if(!this.state.roomData.sockets[socketId].ready){
                                    return <div className='bluePlayer' key={index}>{this.state.roomData.sockets[socketId].name}</div>
                                }else {
                                    return <div className='bluePlayer' key={index}>{this.state.roomData.sockets[socketId].name}&#9745;</div>
                                }
                            }
                        })}
                        </div>
                   </div>
                </div>
            </div>
            <div id='gameBoard'>
                game board
            </div>
            </div>
        )
    }
}