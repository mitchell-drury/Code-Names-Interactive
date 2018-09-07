import React, {Component} from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import SinglePlayer from './singlePlayer.js';
import TwoPlayer from './twoPlayer.js';
import Home from './home.js';

export default class Main extends Component {
    constructor () {
        super ();

        this.state = {
            socket: {}
        }
    }

    componentDidMount () {
        // this.setState({socket: connectToSite(this.insertMole, this.setGameState)})
    }

    // insertMole () {
    //     let newMoles = this.state.moleLocations;
    //     let openCells = [];
    //     for (let i = 0; i < 5; i++) {
    //         for (let j = 0; j < 5; j++){
    //             if (!this.state.moleLocations[i][j]){
    //                 openCells.push({i:i, j:j})
    //             }
    //         }
    //     }
    //     checkWinLoss();
    //     if (openCells.length < 10){
    //         this.setGameState('lost')
    //         wonGame(this.state.socket);
    //     } else {
    //         let num = Math.floor(Math.random()*openCells.length);
    //         newMoles[openCells[num].i][openCells[num].j] = true;
    //         this.setState({moleLocations:newMoles})
    //     }
    // }

    // checkWinLoss() {
    //     if (this.state.gameMode === 'singlePlayer') {
    //         if (openCells.length < 10) {
    //             this.setGameState('lost');
    //         }
    //     }
    // }

    // setGameState (gameState) {
    //     if (gameState === 'active') {
    //         for (let i = 0; i < 10; i++){
    //             this.insertMole();
    //         }
    //         this.setState({gameState: gameState})
    //     } else {
    //         this.setState({moleLocations:initialMoles, gameState: gameState})
    //     }
    //     console.log('after set game state', this.state.gameState, this.state.moleLocations)
    // }

    // whackMole (cellNumber) {
    //     let newMoles = this.state.moleLocations;
    //     newMoles[Math.floor(cellNumber/5)][(cellNumber+5)%5] = false;
    //     this.setState({moleLocations: newMoles});
    //     if (this.state.gameMode === 'twoPlayer'){
    //         sendMole(this.state.socket);
    //     }
    // }

    render () {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route exact path="/singleplayer" component={SinglePlayer}/>
                    <Route exact path="/twoplayer" component={TwoPlayer}/>
                </Switch>
            </BrowserRouter> 
        )
    }
}