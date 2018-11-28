import React, {Component} from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import Gameboard from './gameboard.js';
import Axios from 'Axios';
import { timingSafeEqual } from 'crypto';

export default class SinglePlayer extends Component {
    constructor (props) {
        super (props)
        this.state = {
            gameState: 'firstGame',
            molesWhacked: 0,
            openSpaces: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
            wormSpace: null,
            speed: 1000,
            speedChange: false,
            whackable: true,
            stats: ''
        }

        this.startGame = this.startGame.bind(this);
        this.endGame = this.endGame.bind(this);
        this.addMole = this.addMole.bind(this);
        this.whackMole = this.whackMole.bind(this);
        this.whackWorm = this.whackWorm.bind(this);
        this.moveWorm = this.moveWorm.bind(this);
    }

    componentDidMount () {
        //basic instructions will appear during this countdown only the first time the player starts
        this.timer = setTimeout(this.startGame, 2000)
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
        this.timer = setInterval(this.addMole, this.state.speed)
    }

    endGame () {
        //do end game stuff 1: message, 2: update player database record, 3: clear timer
        clearInterval(this.timer);
        this.setState({gameState: 'ended', speed: 1000, speedChange:false});
        Axios.post('/api/endgame', {
            score: this.state.molesWhacked
        })
        .then(user => {
            if (user.data) {
                this.setState({
                    stats: <div> {'High score: ' + user.data.highScoreSingle}
                    <br></br> 
                    {'Games Played: ' + user.data.gamesPlayed} <br></br>
                    {'Average: ' + (user.data.cumulativeScore/user.data.gamesPlayed).toFixed(2)}
                    </div>
                })
            } else {
                this.setState({stats:"Create an account or log in to keep track of your stats."})
            }
        });
    }

    addMole () {
        let newMoleIndex = Math.floor(Math.random() * this.state.openSpaces.length);
        let newOpenSpaces = this.state.openSpaces;
        newOpenSpaces.splice(newMoleIndex, 1);
        this.setState({openSpaces: newOpenSpaces});
        if (this.state.openSpaces.length < 20) {
            this.endGame();
        }
        if (this.state.speedChange){
            this.setState({speedChange:false})
            clearInterval(this.timer);
            this.timer = setInterval(this.addMole, this.state.speed)
        }
    }

    whackMole (event) {
        if (this.state.molesWhacked === 9){
            this.setState({speedChange: true, speed: 800})
        } else if (this.state.molesWhacked === 19){
            this.setState({speedChange: true, speed: 600})
        } else if (this.state.molesWhacked === 29) {
            this.setState({speedChange: true, speed: 400})
        } else if (this.state.molesWhacked === 49) {
            this.setState({speedChange: true, speed: 250})
        } else if (this.state.molesWhacked === 99) {
            this.setState({speedChange: true, speed: 200})
        } else if (this.state.molesWhacked === 250) {
            this.setState({speedChange: true, speed: 150})
        } else if (this.state.molesWhacked === 500) {
            this.setState({speedChange: true, speed: 100})
        }
        if (this.state.molesWhacked % 10 === 0){
            this.moveWorm();
        }
        let newOpenSpaces = this.state.openSpaces;
        newOpenSpaces.push(parseInt(event.target.getAttribute('cellid')));
        this.setState(
            {molesWhacked: this.state.molesWhacked+1,
            openSpaces: newOpenSpaces     
        });
    }

    whackWorm () {
        //freeze ability to whack moles for .5 seconds
        this.setState({whackable: false})
        setTimeout(() => {
                this.setState({whackable: true})
            }, 250
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
        if (this.state.gameState === 'firstGame') {
            return (
                <div id="singlePlayer">
                    <div id='startInstructions' className='message'> 
                        Whack the moles as they appear, but don't hurt the worms!
                    </div>
                </div>
            )
        } else if (this.state.gameState === 'active') {
            return (
                <Gameboard openSpaces={this.state.openSpaces} wormSpace={this.state.wormSpace} whackMole={this.whackMole} whackWorm={this.whackWorm} whackable={this.state.whackable}/>
            )
        } else {
            return (
                <div id="singlePlayer">
                    <div className='message'> 
                        The moles have over run your yard! You whacked {this.state.molesWhacked} moles.
                        <br></br><br></br>
                        {this.state.stats}
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