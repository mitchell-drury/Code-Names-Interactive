import React, {Component} from 'react';
import Board from './board';
import Cell from './cell';
import Controls from './controls';
import {connectToSite, joinWaiting, leaveWaiting, sendMole, wonGame} from '../../public/clientSocket.js';
const initialMoles = [
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false]
];

export default class Main extends Component {
    constructor () {
        super ();

        this.state = {
            socket: {},
            moles: 0,
            moleLocations: initialMoles,
            gameState: null
        }

        this.joinWaitingRoom = this.joinWaitingRoom.bind(this);
        this.leaveWaitingRoom = this.leaveWaitingRoom.bind(this);
        this.whackMole = this.whackMole.bind(this);
        this.setGameState = this.setGameState.bind(this);
        this.insertMole = this.insertMole.bind(this);
    }

    componentDidMount () {
        this.setState({socket: connectToSite(this.insertMole, this.setGameState)})
    }

    insertMole () {
        let newMoles = this.state.moleLocations;
        let openCells = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++){
                if (!this.state.moleLocations[i][j]){
                    openCells.push({i:i, j:j})
                }
            }
        }
        if (openCells.length < 10){
            this.setState({gameState: 'lost'})
            wonGame(this.state.socket);
        } else {
            let num = Math.floor(Math.random()*openCells.length);
            newMoles[openCells[num].i][openCells[num].j] = true;
            this.setState({moleLocations:newMoles})
        }
    }

    setGameState (gameState) {
        if (gameState === 'active') {
            for (let i = 0; i < 10; i++){
                this.insertMole();
            }
            this.setState({gameState: gameState})
        } else {
            console.log('setting game state,', initialMoles)
            this.setState({moleLocations:initialMoles, gameState: gameState}).then();
        }
        console.log('after set game state', this.state.gameState)
    }

    joinWaitingRoom () {
        this.setState({gameState: 'waiting'});
        joinWaiting(this.state.socket);
    }

    leaveWaitingRoom () {
        this.setState({gameState: 0});
        leaveWaiting(this.state.socket);
    }

    whackMole (cellNumber) {
        let newMoles = this.state.moleLocations;
        newMoles[Math.floor(cellNumber/5)][(cellNumber+5)%5] = false;
        this.setState({moleLocations: newMoles});
        sendMole(this.state.socket);
    }

    render () {
        let display;
        console.log(this.state.gameState)
        if (!this.state.gameState) {
            display = <div id='controls'>
                <div id='randomMatch' className='button' onClick=           {this.joinWaitingRoom}> 
                    Random Oponent 
                </div>
                <div id='singlePlayer' className='button' onClick=            {this.singlePlayer}> 
                     Single Player 
                </div>
            </div>
        } else if (this.state.gameState === 'waiting') {
            display = <div id='controls'> <div className='message'> Waiting </div></div>
        } else if (this.state.gameState === 'won') {
            display = <div id='controls'>
            <div className='message'> You won the match! </div>
            <hr />
            <div id='randomMatch' className='button' onClick=           {this.joinWaitingRoom}> 
                Play Again 
            </div>
            <div id='quit' className='button' onClick=            {this.leaveWaitingRoom}> 
                 Quit 
            </div>
        </div>
        } else if (this.state.gameState === 'lost') {
            display = <div id='controls'>
            <div className='message'> You lost the match! </div>
            <hr />
            <div id='randomMatch' className='button' onClick=           {this.joinWaitingRoom}> 
                Play Again 
            </div>
            <div id='quit' className='button' onClick=            {this.leaveWaitingRoom}> 
                 Quit 
            </div>
        </div>
        } else if (this.state.gameState === 'active') {
            display = <div id='exitGame'>
            </div>
        }

        return (
            <div id='gameBoard'>
                <Board whackMole={this.whackMole} moleLocations={this.state.moleLocations}/>
                {display}
            </div>
        )
    }
}