import React, {Component} from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import Gameboard from './gameboard.js';
import Axios from 'Axios';

export default class SinglePlayer extends Component {
    constructor (props) {
        super (props)
        this.state = {
            gameState: 'firstGame',
            molesWhacked: 0,
            openSpaces: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
        }

        this.startGame = this.startGame.bind(this);
        this.endGame = this.endGame.bind(this);
        this.addMole = this.addMole.bind(this);
        this.whackMole = this.whackMole.bind(this);
    }

    componentDidMount () {
        //basic instructions will appear during this countdown only the first time the player starts
        this.timer = setTimeout(this.startGame, 3000)
    }

    componentWillUnmount () {
        clearInterval(this.timer);
    }

    startGame () {
        this.setState({
            gameState: 'active', 
            molesWhacked:0,
            openSpaces: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
        });
        this.timer = setInterval(this.addMole, 1500)
    }

    endGame () {
        //do end game stuff 1: message, 2: update player database record, 3: clear timer
        clearInterval(this.timer);
        this.setState({gameState: 'ended'});
        Axios.post('/api/endgame', {
            score: this.state.molesWhacked
        });
    }

    addMole () {
        let newMoleIndex = Math.floor(Math.random() * this.state.openSpaces.length);
        let newOpenSpaces = this.state.openSpaces;
        newOpenSpaces.splice(newMoleIndex, 1);
        this.setState({openSpaces: newOpenSpaces});
        if (this.state.openSpaces.length < 22) {
            this.endGame();
        }
    }

    whackMole (event) {
        if (this.state.molesWhacked === 9){
            clearInterval(this.timer)
            this.timer = setInterval(this.addMole, 1000);
        } else if (this.state.molesWhacked === 24){
            clearInterval(this.timer)
            this.timer = setInterval(this.addMole, 800);
        } else if (this.state.molesWhacked === 49) {
            clearInterval(this.timer)
            this.timer = setInterval(this.addMole, 600);
        } else if (this.state.molesWhacked === 74) {
            clearInterval(this.timer)
            this.timer = setInterval(this.addMole, 500);           
        } else if (this.state.molesWhacked === 99) {
            clearInterval(this.timer)
            this.timer = setInterval(this.addMole, 400);           
        } else if (this.state.molesWhacked === 149) {
            clearInterval(this.timer)
            this.timer = setInterval(this.addMole, 300);           
        } else if (this.state.molesWhacked === 199) {
            clearInterval(this.timer)
            this.timer = setInterval(this.addMole, 250);           
        }
        let newOpenSpaces = this.state.openSpaces;
        newOpenSpaces.push(parseInt(event.target.getAttribute('cellid')));
        this.setState(
            {molesWhacked: this.state.molesWhacked+1,
            openSpaces: newOpenSpaces     
        });
    }

    render () {
        if (this.state.gameState === 'firstGame') {
            return (
                <div id="singlePlayer">
                    <div id='startInstructions' className='message'> 
                        Whack the moles as they appear! 
                    </div>
                </div>
            )
        } else if (this.state.gameState === 'active') {
            return (
                <Gameboard openSpaces={this.state.openSpaces} whackMole={this.whackMole}/>
            )
        } else {
            return (
                <div id="singlePlayer">
                    <div className='message'> 
                        The moles have over run your yard! You whacked {this.state.molesWhacked} moles.
                    </div>
                    <div className='button' onClick={this.startGame}>
                        Play Again
                    </div>
                    <Link className='button' to='/'>
                        Home
                    </Link>
                </div>
            )
        }
    }
} 