import React, {Component} from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import SinglePlayer from './singlePlayer.js';
import TwoPlayer from './twoPlayer.js';
import Home from './home.js';
import io from 'socket.io-client'
//require('react-lumberjack');

const socket = io()

socket.on('connect', () => {
    console.log('Connected!, My Socket Id:', socket.id)
})

export default class Main extends Component {
    constructor () {
        super ();

        this.state = {
            challengers: []
        }
    }

    componentDidMount () {
        socket.on('challenger', newChallenger => {           
            if (!this.state.challengers.includes(newChallenger)){
                this.setState(state => ({
                    challengers: state.challengers.concat(newChallenger)}))
            }
        })

        socket.on('challengeRescinded', formerChallenger => {
            this.setState(state => ({
                challengers: state.challengers.filter(challenger => challenger != formerChallenger)
            }))
        })
    }

    componentWillUnmount () {
        console.log ('main unmounting')
    }

    render () {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" render={() => <Home socket={socket}/>}/>
                    <Route exact path="/singleplayer" render={() => <SinglePlayer socket={socket}/>}/>
                    <Route exact path="/twoplayer" render={() => <TwoPlayer socket={socket} challengers={this.state.challengers}/>}/>
                </Switch>
            </BrowserRouter> 
        )
    }
}