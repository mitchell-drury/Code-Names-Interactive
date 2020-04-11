import React, {Component} from 'react';
import {socket} from './clientRoutes.js';
import RequestToJoin from './requestToJoin.js';

export default class RemoteGame extends Component {
    constructor (props) {
        super (props);

        this.state = {
            requests: []
        }

        socket.on('trying to join', (name, requestingSocket) => {
            this.handleRequest(name, requestingSocket);
        })

        this.handleRequest = this.handleRequest.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.denyRequest = this.denyRequest.bind(this);
    }

    componentWillUnmount() {
        //also remove socket from game room
        socket.off('trying to join');
    }
    
    handleRequest(name, requestingSocket) {
        console.log('user trying to join: ', name, ' ', requestingSocket,  ' state: ', this.state);
        let requests = this.state.requests.concat(
            {name: name,
            requestingSocket: requestingSocket}
        );
        this.setState({
            requests: requests
        })
    }

    acceptRequest(requestingSocket) {
        socket.emit('accepted', requestingSocket)
        console.log('accept');
    }

    denyRequest(requestingSocket) {
        let updatedRequests = this.state.requests.filter(request => request.requestingSocket != requestingSocket)
        this.setState({
            requests:updatedRequests
        })
        socket.emit('denied', requestingSocket);
        console.log('deny');
    }

    render () {
        return (
            <div id='remoteGame'>
                <div id='requests'>
                    Requests to Join:
                    <ul>
                    {this.state.requests.map(request => {
                        return <RequestToJoin key={request.name} acceptRequest={this.acceptRequest} denyRequest={this.denyRequest} request={request}/>
                    })}
                    </ul>
                </div>
                <div id='chat'>
                    Room Discussion:
                </div>
                <div id='remoteGame'>
                    remote game
                </div>
            </div>
        )
    }
}