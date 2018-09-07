import React, {Component} from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import Axios from 'Axios';
import Gameboard from './gameboard';
import io from 'socket.io-client'
const socket = io(window.location.origin)

export default class TwoPlayer extends Component {
    constructor () {
        super ()

        this.state = {
            isLoggedIn: false,
            challengeStatus: false,
            gameState: 'inactive',
            message: 'Welcome to the yard.',
            openSpaces: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
        }
        this.setChallengeStatus = this.setChallengeStatus.bind(this, status);
        this.searchOpponent = this.searchOpponent.bind(this);
        this.joinWaitingRoom = this.joinWaitingRoom.bind(this);
        this.leaveWaitingRoom = this.leaveWaitingRoom.bind(this);
        this.whackMole = this.whackMole.bind(this);
        this.insertMole = this.insertMole.bind(this);
        this.initializeMoles = this.initializeMoles.bind(this);
        this.setGameState = this.setGameState.bind(this);
        this.setLoggedIn = this.setLoggedIn.bind(this);
    }

    componentDidMount () {
        this.setLoggedIn();
        socket.on('connect', () => {
            console.log('Connected!, My Socket Id:', socket.id)
        })
        socket.on('joinedwaiting', msg => {
            console.log(msg)
        })
        socket.on('leftwaiting', msg => {
            console.log(msg);
        })
        socket.on('moleSent', () => {
            console.log('received mole')
            this.insertMole();
        })
        socket.on('matched', () => {
            this.setGameState('active');
            this.initializeMoles();
        })
        socket.on('won', () => {
            console.log('I won');
            this.setGameState('inactive', 'You won the match');
        })
    }

    setLoggedIn () {
        Axios.post('/account/authenticate')
        .then(isLoggedIn => {
            this.setState({isLoggedIn: isLoggedIn.data})
        })
    }

    setChallengeStatus(status){
        console.log('challenge status: ', status);
        Axios.post('/account/updateChallengeStatus', {challengeStatus: event.target.value})
        .then(
            this.setState({challengeStatus: status})
        )
    }

    searchOpponent () {

    }

    joinWaitingRoom () {
        this.setState({gameState: 'waiting'});
        socket.emit('join', 'waiting');
        console.log(socket);
    }

    leaveWaitingRoom () {
        this.setState({gameState: 'inactive'});
        socket.emit('leave', 'waiting');
    }

    setGameState (gameState, message) {
        this.setState({gameState: gameState, message: message})
    }

    whackMole (event) {
        //remove from my grid
        let newOpenSpaces = this.state.openSpaces;
        newOpenSpaces.push(parseInt(event.target.getAttribute('cellid')));
        this.setState({openSpaces: newOpenSpaces});
        console.log('mole whacked')
        //emit to opponent
        socket.emit('sendMole', socket.opponent)
    }

    insertMole () {
        //insert a mole to my grid and check for loss
        let newMoleIndex = Math.floor(Math.random() * this.state.openSpaces.length);
        let newOpenSpaces = this.state.openSpaces;
        newOpenSpaces.splice(newMoleIndex, 1);
        this.setState({openSpaces: newOpenSpaces});
        if (this.state.openSpaces.length < 11) {
            socket.emit('won', socket.opponent);
            this.setState({gameState:'inactive', message:'You lost'})
        }
        console.log('inserting mole');
    }

    initializeMoles () {
        let newMoleIndex;
        let newOpenSpaces = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
        for (let i = 0; i < 10; i++) {
            newMoleIndex = Math.floor(Math.random() * newOpenSpaces.length);
            newOpenSpaces.splice(newMoleIndex, 1);
        }
        this.setState({openSpaces: newOpenSpaces});
    }

    render () {
        if (this.state.gameState === 'active'){
            return (
                <Gameboard openSpaces={this.state.openSpaces} whackMole={this.whackMole}> </Gameboard>
            )
        } else if (this.state.gameState === 'inactive'){
            if (this.state.isLoggedIn) {
                return (
                    <div> 
                        <div className='message'> 
                            {this.state.message}
                        </div>
                        <div className='button' onClick={this.joinWaitingRoom}> Random Opponent </div>
                        <form>
                            <input type='text' placeholder='Opponent user name'/>
                        
                            <button type='submit' className='button' onClick={this.searchOpponent}> Send Challenge </button>
                        </form>
                        <div className='button' onClick={this.setChallengeStatus} > Accept Challenges </div>
                         <Link className='button' to='/'> Home </Link>
                    </div>
                )
            } else {
                return (
                    <div>
                        <div className='message'> 
                            {this.state.message}
                        </div>
                        <div className='button' onClick={this.joinWaitingRoom}> Random Opponent </div>
                       <Link className='button' to='/'> Home </Link>
                    </div>
                )
            }
        } else if (this.state.gameState === 'waiting') {
            return (
                <div>
                    <div className='message'> Waiting for an opponent to match.
                    </div>
                    <div className='button' onClick={this.leaveWaitingRoom}>
                        Quit
                    </div>
                </div>
            )
        }
    }
} 