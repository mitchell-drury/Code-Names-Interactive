import React, {Component} from 'react';
import Board from './board';
import Cell from './cell';
import Controls from './controls';
import {connectToSite, joinWaiting, leaveWaiting, sendMole, wonGame} from '../../public/clientSocket.js';

export default class Main extends Component {
    constructor () {
        super ();

        this.state = {
            socket: {},
            moles: 0,
            gameState: null
        }

        this.joinWaitingRoom = this.joinWaitingRoom.bind(this);
        this.leaveWaitingRoom = this.leaveWaitingRoom.bind(this);
        this.whackMole = this.whackMole.bind(this);
        this.incrementMoles = this.incrementMoles.bind(this);
        this.setGameState = this.setGameState.bind(this);
        this.quit = this.quit.bind(this);
    }

    componentDidMount () {
        this.setState({socket: connectToSite(this.incrementMoles, this.setGameState)})
    }

    incrementMoles () {
        this.setState({moles: this.state.moles + 1}) 
        if (this.state.moles >= 10) {
            this.setState({gameState: 'lost'})
            wonGame(this.state.socket);
        }  
    }

    setGameState (gameState) {
        console.log('this:', this);
        console.log(gameState, 'state:', this.state);
        let moles;
        if (gameState === 'active' || gameState === 'waiting') {
            moles = 0;
        }
        this.setState({gameState: gameState, moles: moles});
    }

    joinWaitingRoom () {
        this.setState({gameState: 'waiting'});
        console.log(this.state);
        joinWaiting(this.state.socket);
    }

    leaveWaitingRoom () {
        this.setState({gameState: null, moles: 0})
        leaveWaiting(this.state.socket);
    }

    quit () {
        this.setState({gameState: null, moles: 0})
    }

    whackMole () {
        if (this.state.moles > 0){
            this.setState({moles: this.state.moles - 1})
        }
        console.log('whacking', this.state.socket);
        sendMole(this.state.socket);
    }

    render () {
        let display;
        console.log(this.state.gameState)
        if (!this.state.gameState) {
            display = <div>
                <div id='randomMatch' className='button' onClick=           {this.joinWaitingRoom}> 
                    Random Oponent 
                </div>
                <div id='singlePlayer' className='button' onClick=            {this.singlePlayer}> 
                     Single Player 
                </div>
            </div>
        } else if (this.state.gameState === 'waiting') {
            display = <div id='waitingRoom'> Waiting </div>
        } else if (this.state.gameState === 'won') {
            display = <div id='won'>
            <div> You won the match! </div>
            <hr />
            <div id='randomMatch' className='button' onClick=           {this.joinWaitingRoom}> 
                Play Again 
            </div>
            <div id='quit' className='button' onClick=            {this.quit}> 
                 Quit 
            </div>
        </div>
        } else if (this.state.gameState === 'lost') {
            display = <div id='lost'>
            <div> You lost the match! </div>
            <hr />
            <div id='randomMatch' className='button' onClick=           {this.joinWaitingRoom}> 
                Play Again 
            </div>
            <div id='quit' className='button' onClick=            {this.quit}> 
                 Quit 
            </div>
        </div>
        } else if (this.state.gameState === 'active') {
            display = <div id='gameBoard'>
            <div id='sendMole' className='button' onClick=      {this.whackMole}> 
                Whack Mole
            </div>
            <div id='moleCount' className='moleCount'>
                {this.state.moles}
            </div>
            </div>
        }

        return (
            <div id='gameBoard'>
                {Board}
                {display}
            </div>
        )
    }
}