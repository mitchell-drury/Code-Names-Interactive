import React, {Component} from 'react';
import {Redirect} from 'react-router';
import {socket} from './clientRoutes.js';

export default class createRemoteGame extends Component {
    constructor (props) {
        super (props);
        this.state = {
            newGameRoom: '',
            userName: '',
            createRoomMessage: '',
            remoteGame: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.userNameChange = this.userNameChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        
        socket.on('new room created', (msg) => {
            this.setState({remoteGame: true});
            console.log("room created: ", msg);
        });

        socket.on('room name already taken', (msg) => {
            this.setState({
                createGameMessage: '\'' + msg + '\' Is Already Taken :('
            });
        });
    }   

    componentWillUnmount() {
        socket.off('new room created');
        socket.off('room name already taken');
    }

    handleChange(event) {
        this.setState({newGameRoom: event.target.value});
    }

    userNameChange(event) {
        this.setState({userName: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        //do more stringenet checking here 
        if(this.state.newGameRoom === '' || this.state.userName === '') {
            return;
        }
        document.getElementById('createGameMessage').innerHTML = '';
        document.getElementById('newRoomName').value = '';
        socket.emit('create room', this.state.newGameRoom, this.state.userName); 
    }

    render () {
        if(this.state.remoteGame) {
            return <Redirect push to={'/remoteGame?gameRoom=' + this.state.newGameRoom}></Redirect>
        }

        return (
            <div id='createGame' className='homeScreenOption'>
                <form onSubmit={this.handleSubmit}>
                    Create Game
                    <input id='newRoomName' className='homeInput' type='text' onChange={this.handleChange} autoComplete='off'></input>
                    <input id='userName' className='homeInput' type='text' onChange={this.userNameChange} autoComplete='off'></input>
                    <input type='submit' value='Create Game'></input>
                    <div id='createGameMessage'>{this.state.createGameMessage}</div>
                </form>
            </div>
        )
    }
}