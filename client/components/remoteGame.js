import React, {Component} from 'react';
import {socket} from './clientRoutes.js';
import RequestToJoin from './requestToJoin.js';
import * as QueryString from 'query-string';

export default class RemoteGame extends Component {
    constructor (props) {
        super (props);

        this.state = {
            requests: [],
            chat: [{sender: 'mitch', message: 'hey there guys'}],
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

        socket.on('new member', (requestingSocket) => {
            this.removeRequest(requestingSocket);
        })

        socket.on('member denied', (requestingSocket) => {
            this.removeRequest(requestingSocket);
        })

        socket.on('new message', (sender, message) => {
            let newChat = [{sender: sender, message: message}].concat(this.state.chat)
            this.setState({chat: newChat});
        })

        this.handleRequest = this.handleRequest.bind(this);
        this.removeRequest = this.removeRequest.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.denyRequest = this.denyRequest.bind(this);
        this.submitChat = this.submitChat.bind(this);
    }

    componentDidMount() {
        socket.emit('get game data', this.state.params.gameRoom);
    }

    componentWillUnmount() {
        //also remove socket from game room? or at least emit that left
        socket.off('trying to join');
        socket.off('cancel request');
        socket.off('game data');
        socket.off('new member');
        socket.off('member denied');
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

    submitChat(event) {
        event.preventDefault();
        socket.emit('chat message', event.target.value, this.state.params.gameRoom);
    }

    render() {
        return (
            <div id='remoteGame'>
            <div id='topBar'>
                <div id='requests'>
                    Requests to Join
                    <ul>
                    {this.state.requests.map(request => {
                        return <RequestToJoin key={request.name} acceptRequest={this.acceptRequest} denyRequest={this.denyRequest} request={request}/>
                    })}
                    </ul>
                </div>
                <div id='chat'>
                    Room Discussion
                    <ul>
                    {this.state.chat.map(message => {
                        return <div key={message.sender}>{message.sender}: {message.message}</div>
                    })}
                    </ul>
                    <form id='chatForm' onSubmit={this.submitChat}>
                    <input type='text' id='chatInput' className='inline'></input>
                    <input type='submit' id='chatSubmit' className='inline'></input>
                    </form>
                </div>
                <div id='players'>
                    Players
                </div>
            </div>
            <div id='gameBoard'>
                    game board
            </div>
            </div>
        )
    }
}