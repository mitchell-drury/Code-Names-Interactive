import React, {Component} from 'react';
import {socket} from './clientRoutes.js';
import RequestToJoin from './requestToJoin.js';
import * as QueryString from 'query-string';

export default class RemoteGame extends Component {
    constructor (props) {
        super (props);

        this.state = {
            requests: [],
            chat: [],
            players: [],
            message: '',
            params: QueryString.parse(location.search),
            acceptedToRoom: false,
            gameData: {}
        }

        socket.on('trying to join', (name, requestingSocket, room) => {
            this.handleRequest(name, requestingSocket, room);
        })

        socket.on('cancel request', (requestingSocket) => {
            this.removeRequest(requestingSocket);
        })

        socket.on('game data', (gameData) => {
            console.log(gameData);
        })

        socket.on('new member', (requestingSocket, name, color) => {
            console.log('new member');
            this.removeRequest(requestingSocket);
            let updatedPlayers = [{name: name, color: color}].concat(this.state.players);
            this.setState({players: updatedPlayers});
        })

        socket.on('member denied', (requestingSocket) => {
            this.removeRequest(requestingSocket);
        })

        socket.on('new message', (sender, message) => {
            let newChat = [{sender: sender, message: message}].concat(this.state.chat)
            this.setState({chat: newChat});
        })

        socket.on('member left'), (name) => {
            //remove from player list
            let updatedPlayers = this.state.players.filter(player => {
                player.name != name
            })
            this.setState({players: updatedPlayers});
        }

        this.handleRequest = this.handleRequest.bind(this);
        this.removeRequest = this.removeRequest.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.denyRequest = this.denyRequest.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.submitChat = this.submitChat.bind(this);
    }

    componentDidMount() {
        socket.emit('get game data', this.state.params.gameRoom);
    }

    componentWillUnmount() {
        socket.off('trying to join');
        socket.off('cancel request');
        socket.off('game data');
        socket.off('new member');
        socket.off('member denied');
        socket.off('new message');
        socket.emit('member left');
    }
    
    handleRequest(name, requestingSocket, roomToJoin) {
        console.log('user trying to join: ', name, ' ', requestingSocket,  ' state: ', this.state);
        let requests = [{name: name, requestingSocket: requestingSocket, roomToJoin: roomToJoin}].concat(this.state.requests);
        this.setState({
            requests: requests
        })
    }

    removeRequest(requestingSocket) {
        let updatedRequests = this.state.requests.filter(request => request.requestingSocket != requestingSocket)
        this.setState({
            requests:updatedRequests
        })    
    }

    acceptRequest(request) {
        socket.emit('accepted', request.name, request.requestingSocket, request.roomToJoin);
    }

    denyRequest(request) {
        socket.emit('denied', request.requestingSocket, request.roomToJoin);
    }

    changeMessage(event) {
        this.setState({message: event.target.value});
    }

    submitChat(event) {
        event.preventDefault();
        document.getElementById('chatInput').value = '';
        socket.emit('chat message', this.state.message, this.state.params.gameRoom);
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
                        {this.state.requests.map((request, index) => {
                            return <RequestToJoin key={index} acceptRequest={this.acceptRequest} denyRequest={this.denyRequest} request={request}/>
                        })}
                    </div>
                </div>
                <div id='chat'>
                    <div id='roomName'>
                        Room: {this.state.params.gameRoom}
                    </div>
                    <div id='chatMessages'>
                    {this.state.chat.map((message, index) => {
                        return <div className='chatMessage' key={index}>{message.sender}: {message.message}</div>
                    })}
                    </div>
                    <form id='chatForm' onSubmit={this.submitChat}>
                        <input type='text' id='chatInput' className='inline' onChange={this.changeMessage}></input>
                        <input type='submit' id='chatSubmit' className='inline'></input>
                    </form>
                </div>
                <div id='players'>
                    <div id='playersTitle'>
                        Players
                    </div>
                    <div id='playersList'>
                        {this.state.players.map((player, index) => {
                            return <div id='player' key={index}>{player.name}</div>
                        })}
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