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

        socket.on('new member', (requestingSocket, players) => {
            console.log('new member, players: ', players);
            this.removeRequest(requestingSocket);
            this.setState({players: players});
        })

        socket.on('member denied', (requestingSocket) => {
            this.removeRequest(requestingSocket);
        })

        socket.on('new message', (sender, message) => {
            let newChat = [{sender: sender, message: message}].concat(this.state.chat)
            this.setState({chat: newChat});
        })

        socket.on('change color', (socketId, color) => {
            let updatedPlayers = [...this.state.players];
            let indexId = this.state.players.findIndex(player => 
                player.socket == socketId
            )
            if(indexId > -1){
                updatedPlayers[indexId].color = color;
                this.setState({players: updatedPlayers});
            }
        })

        socket.on('change ready', (socketId, readyState) => {
            let updatedPlayers = [...this.state.players];
            let indexId = this.state.players.findIndex(player => 
                player.socket == socketId
            )
            if(indexId > -1){
                updatedPlayers[indexId].ready = readyState;
                this.setState({players: updatedPlayers});
            }           
        })

        socket.on('member left', (socket) => {
            console.log(socket, ' to remove');
            let updatedPlayers = this.state.players.filter(player => {
                return player.socket != socket;
            })
            this.setState({players: updatedPlayers});
        })

        socket.on('start game', () => {

        })

        this.handleRequest = this.handleRequest.bind(this);
        this.removeRequest = this.removeRequest.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.denyRequest = this.denyRequest.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.submitChat = this.submitChat.bind(this);
        this.changeColor = this.changeColor.bind(this);
        this.changeReady = this.changeReady.bind(this);
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
        socket.off('member left');
        socket.off('new message');
        socket.off('change color');
        socket.emit('member left', this.state.params.gameRoom);
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
                        Players:
                    </div>
                    <div id='playersList'>
                        <div id='redPlayers'>
                        {this.state.players.filter(player => player.color == 'red').map((player, index) => {
                            if(player.socket === socket.id){
                                return <div className='redPlayer' key={index}><input type='checkbox' onChange={this.changeReady}></input>{player.name}<span className='rightArrow' onClick={this.changeColor}>&rarr;</span></div>
                            }else {
                                if(!player.ready){
                                    return <div className='redPlayer' key={index}>{player.name}</div>
                                }else {
                                    return <div className='redPlayer' key={index}>&#9745;{player.name}</div>
                                }
                            }
                        })}
                        </div>
                        <div id='bluePlayers'>
                        {this.state.players.filter(player => player.color == 'blue').map((player, index) => {
                            if(player.socket === socket.id){
                                return <div className='bluePlayer' key={index}><span className='leftArrow' onClick={this.changeColor}>&larr;</span>{player.name}<input type='checkbox' onChange={this.changeReady}></input></div>
                            }else {
                                if(!player.ready){
                                    return <div className='bluePlayer' key={index}>{player.name}</div>
                                }else {
                                    return <div className='bluePlayer' key={index}>{player.name}&#9745;</div>
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