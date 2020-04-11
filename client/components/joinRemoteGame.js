import React, {Component} from 'react';
import {Redirect} from 'react-router';
import {socket} from './clientRoutes.js';

export default class joinRemoteGame extends Component {
    constructor (props) {
        super (props);
        this.state = {
            gameToJoin: '',
            name: '',
            remoteGame: false,
            joinGameMessage: '',
            waitingForResponse: false
        }

        this.handleGameChange = this.handleGameChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.cancelRequest = this.cancelRequest.bind(this);

        socket.on('accepted', () => {
            //join socket to room
            this.setState({remoteGame:true})
        })
        socket.on('denied', () => {
            console.log('denied entry to this room');
            this.setState({waitingForResponse:false});
        })

        socket.on('room does not exist', () => {
            this.setState({joinGameMessage: 'room does not exist', waitingForResponse: false});
        })
    }

    componentWillUnmount() {
        socket.off('accepted');
        socket.off('denied');
    }

    handleGameChange(event) {
        this.setState({gameToJoin: event.target.value});
    }

    handleNameChange(event) {
        this.setState({name: event.target.value});
    }

    cancelRequest() {
        socket.emit('cancelRequest', this.state.gameToJoin);
        this.setState({gameToJoin: '', waitingForResponse: false});
    }

    handleSubmit(event) {
        event.preventDefault();
        //can do some more stringent checking here
        if(this.state.gameToJoin === '' || this.state.name === '') {
            return
        }
        document.getElementById('joinGameMessage').innerHTML = '';
        document.getElementById('gameToJoin').value = '';
        socket.emit('joinGame', this.state.gameToJoin, this.state.name);
        this.setState({waitingForResponse:true});  
    }

    render () {
        if(this.state.remoteGame) {
            return <Redirect push to='/remoteGame'></Redirect>
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
            <div id='joinRemoteGame' className='homeScreenOption'>
                Join Remote Game
                <form onSubmit={this.handleSubmit} >
                    <input id='gameToJoin' className='homeInput' type='text' onChange={this.handleGameChange}></input>
                    <input id='name' className='homeInput' type='text' onChange={this.handleNameChange}></input>
                    <input type='submit'></input>
                    <div id='joinGameMessage'>{this.state.joinGameMessage}</div>
                </form>
            </div>
        )
    }
}