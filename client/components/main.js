import React, {Component} from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import SinglePlayer from './singlePlayer.js';
import TwoPlayer from './twoPlayer.js';
import Home from './home.js';
import io from 'socket.io-client';
import Axios from 'Axios'

const socket = io()

socket.on('connect', () => {
    console.log('Connected!, My Socket Id:', socket.id)
})

export default class Main extends Component {
    constructor () {
        super ();

        this.state = {
            challengers: [],
            loggedIn: false,
            authenticating: true
        }

        this.setLoggedInStatus = this.setLoggedInStatus.bind(this);
    }

    componentDidMount () {
        Axios.post('/account/authenticate')
        .then(response => {
            this.setState({loggedIn: response.data.userLoggedIn, authenticating: false})
        })
        
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

        this.setLoggedInStatus = this.setLoggedInStatus.bind(this);
    }

    componentWillUnmount () {
    }

    setLoggedInStatus (status) {
        this.setState({loggedIn: status})
    }

    render () {
        return (
            !this.state.authenticating &&
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" render={() => <Home socket={socket} loggedIn={this.state.loggedIn} setLoggedInStatus={this.setLoggedInStatus}/>}/>
                    <Route exact path="/singleplayer" render={() => <SinglePlayer socket={socket}/>}/>
                    <Route exact path="/twoplayer" render={() => <TwoPlayer socket={socket} challengers={this.state.challengers} loggedIn={this.state.loggedIn} setLoggedInStatus={this.setLoggedInStatus}/>}/>
                </Switch>
            </BrowserRouter> 
        )
    }
}