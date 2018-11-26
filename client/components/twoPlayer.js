import React, {Component} from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import Axios from 'Axios';
import Gameboard from './gameboard';
import Challenges from './challenges';
import Waiting from './waiting';

export default class TwoPlayer extends Component {
    constructor (props) {
        super (props)

        this.state = {
            gameState: 'inactive',
            message: 'Welcome to the yard.',
            openSpaces: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
            moleCounter: 0,
            wormSpace: null,
            whackable: true
        }

        this.joinWaitingRoom = this.joinWaitingRoom.bind(this);
        this.whackMole = this.whackMole.bind(this);
        this.insertMole = this.insertMole.bind(this);
        this.initializeMoles = this.initializeMoles.bind(this);
        this.whackWorm = this.whackWorm.bind(this);
        this.moveWorm = this.moveWorm.bind(this);
        this.setGameState = this.setGameState.bind(this);
    }

    componentDidMount () {
        this.props.socket.on('opponentNotAvailable', msg => {
            console.log(msg)
        })        
        this.props.socket.on('joinedwaiting', msg => {
            console.log(msg)
        })
        this.props.socket.on('leftwaiting', msg => {
            console.log(msg);
        })
        this.props.socket.on('moleSent', () => {
            this.insertMole();
            if (this.state.moleCounter === 4){
                this.moveWorm();
                this.setState({moleCounter:0})
            } else {
                this.setState({moleCounter:this.state.moleCounter+1})
            }
        })
        this.props.socket.on('matched', () => {
            this.setGameState('active');
        })
        this.props.socket.on('youWon', () => {
            console.log('I won');
            this.setGameState('inactive', 'You won the match');
        })
    }

    joinWaitingRoom () {
        this.setGameState('waiting');
    }

    setGameState (gameState, message) {
        this.setState({gameState: gameState, message: message}, () => {
            if (gameState === 'active'){
                this.initializeMoles();
            }
        })
    }

    whackMole (event) {
        if (this.state.whackable) {
            //remove from my grid
            let newOpenSpaces = this.state.openSpaces;
            newOpenSpaces.push(parseInt(event.target.getAttribute('cellid')));
            this.setState({openSpaces: newOpenSpaces});
            
            //emit the whacked mole to the opponent
            this.props.socket.emit('sendMole', this.props.socket.opponent)
        } else {
            console.log('penalty time for worm whacking!')
        }
    }

    insertMole () {
        //insert a mole to my grid and check for loss
        let newMoleIndex = Math.floor(Math.random() * this.state.openSpaces.length);
        let newOpenSpaces = this.state.openSpaces;
        newOpenSpaces.splice(newMoleIndex, 1);
        this.setState({openSpaces: newOpenSpaces});
        if (this.state.openSpaces.length < 11) {
            this.props.socket.emit('youWon', this.props.socket.opponent);
            this.setState({gameState:'inactive', message:'You lost'})
        }
    }

    initializeMoles () {
        let newMoleIndex;
        let newOpenSpaces = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
        for (let i = 0; i < 10; i++) {
            newMoleIndex = Math.floor(Math.random() * newOpenSpaces.length);
            newOpenSpaces.splice(newMoleIndex, 1);
        }
        let wormIndex = Math.floor(Math.random() * newOpenSpaces.length);
        let wormSpace = newOpenSpaces[wormIndex];
        newOpenSpaces.splice(wormIndex, 1);
        this.setState({openSpaces: newOpenSpaces, wormSpace: wormSpace});
    }

    whackWorm () {
        //freeze ability to whack moles for .5 seconds
        this.setState({whackable: false})
        setTimeout(() => {
                this.setState({whackable: true})
            }, 750
        )
        this.moveWorm();
    }

    moveWorm () {
        console.log('moving worm');
        //select new space from open spaces
        let newWormIndex = Math.floor(Math.random() * this.state.openSpaces.length);

        let newOpenSpaces = this.state.openSpaces;
        let newWormSpace = newOpenSpaces[newWormIndex];

        //add old worm space to open spaces, and take out the new one
        newOpenSpaces.push(this.state.wormSpace);       
        newOpenSpaces.splice(newWormIndex, 1);

        this.setState({openSpaces: newOpenSpaces, wormSpace: newWormSpace});    
    }

    render () {
        if (this.state.gameState === 'active'){
            return (
                <Gameboard socket={this.props.socket} openSpaces={this.state.openSpaces} wormSpace={this.state.wormSpace} whackMole={this.whackMole} whackWorm={this.whackWorm} whackable={this.state.whackable}> </Gameboard>
            )
        } else if (this.state.gameState === 'inactive'){
            if (this.props.loggedIn) {
                return (
                    <div id="twoPlayer"> 
                        <div className='message'> 
                            {this.state.message}
                        </div>
                        <Challenges socket={this.props.socket} challengers={this.props.challengers}/>
                        <div className='button' onClick={this.joinWaitingRoom}> Random Opponent </div>
                        <Link className='button' to='/'> Home </Link>
                    </div>
                )
            } else {
                return (
                    <div id="twoPlayer">
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
                <Waiting socket={this.props.socket} setGameState={this.setGameState}/>
            )
        }
    }
} 