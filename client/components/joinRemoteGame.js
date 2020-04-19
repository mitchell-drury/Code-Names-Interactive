import React, {Component} from 'react';
import {Redirect} from 'react-router';
import {socket} from './clientRoutes.js';

export default class joinRemoteGame extends Component {
    constructor (props) {
        super (props);
        this.state = {
            roomToJoin: '',
            name: '',
            inRoom: false,
            joinGameMessage: '',
            waitingForResponse: false
        }

        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.cancelRequest = this.cancelRequest.bind(this);

        socket.on('accepted', () => {
            this.setState({inRoom:true})
        })

        socket.on('denied', () => {
            this.setState({waitingForResponse:false});
        })

        socket.on('room does not exist', () => {
            this.setState({joinRoomMessage: 'room does not exist', waitingForResponse: false});
        })
    }

    componentWillUnmount() {
        socket.off('accepted');
        socket.off('denied');
        socket.off('room does not exist');
    }

    handleRoomChange(event) {
        this.setState({roomToJoin: event.target.value});
    }

    handleNameChange(event) {
        this.setState({name: event.target.value});
    }

    cancelRequest() {
        socket.emit('cancel request', this.state.roomToJoin);
        this.setState({roomToJoin: '', waitingForResponse: false});
    }

    handleSubmit(event) {
        event.preventDefault();
        //can do some more stringent checking here
        if(this.state.roomToJoin === '' || this.state.name === '') {
            return
        }
        document.getElementById('joinRoomMessage').innerHTML = '';
        document.getElementById('roomToJoin').value = '';
        socket.emit('join room', this.state.roomToJoin, this.state.name);
        this.setState({waitingForResponse:true});  
    }

    render () {
        if(this.state.inRoom) {
            return <Redirect push to={'/remoteGame?gameRoom=' + this.state.roomToJoin}></Redirect>
        }

        if(this.state.waitingForResponse) {
            return (
                <div>
                    Waiting For Response
                    <div id='cancelRequest' onClick={this.cancelRequest}>Cancel Request</div>
                </div>
            )
        }

        return (
            <div id='joinRoom' className='homeScreenOption'>
                Join a Game
                <form onSubmit={this.handleSubmit} >
                    <input id='roomToJoin' className='homeInput' type='text' onChange={this.handleRoomChange}></input>
                    <input id='name' className='homeInput' type='text' onChange={this.handleNameChange}></input>
                    <input type='submit'></input>
                    <div id='joinRoomMessage'>{this.state.joinRoomMessage}</div>
                </form>
            </div>
        )
    }
}