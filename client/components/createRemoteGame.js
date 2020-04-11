import React, {Component} from 'react';
import {Redirect} from 'react-router';
import {socket} from './clientRoutes.js';

export default class createRemoteGame extends Component {
    constructor (props) {
        super (props);
        this.state = {
            newGameRoom: '',
            createRoomMessage: '',
            remoteGame: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        
        socket.on('new room created', (msg) => {
            this.setState({remoteGame: true});
            console.log("room created: ", msg);
            //socket.emit('showRooms');
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

    handleSubmit(event) {
        event.preventDefault();
        //do more stringenet checking here 
        if(this.state.newGameRoom === '') {
            return;
        }
        document.getElementById('createGameMessage').innerHTML = '';
        document.getElementById('newRoomName').value = '';
        socket.emit('showRooms');
        socket.emit('createRoom', this.state.newGameRoom, socket.id);
        this.setState({newGameRoom: ''});  
    }

    render () {
        if(this.state.remoteGame) {
            return <Redirect push to='/remoteGame'></Redirect>
        }

        return (
            <div id='createGame' className='homeScreenOption'>
                <form onSubmit={this.handleSubmit}>
                    Create Game
                    <input id='newRoomName' type='text' className='homeInput' onChange={this.handleChange}></input>
                    <input type='submit'></input>
                    <div id='createGameMessage'>{this.state.createGameMessage}</div>
                </form>
            </div>
        )
    }
}