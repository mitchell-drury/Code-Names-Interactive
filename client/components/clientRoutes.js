import React, {Component} from 'react';
import {BrowserRouter, Route, Switch, Link} from 'react-router-dom';
import Home from './home.js';
import RemoteGame from './remoteGame';
import io from 'socket.io-client';
import Axios from 'Axios'

const socket = io();

socket.on('connect', () => {
    console.log('Connected!, My Socket Id:', socket.id)
})

class ClientRoutes extends Component {
    constructor () {
        super ();

        this.state = {
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

        this.setLoggedInStatus = this.setLoggedInStatus.bind(this);
    }

    setLoggedInStatus (status) {
        this.setState({loggedIn: status})
    }

    render () {
        return (
            !this.state.authenticating &&
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" render={() => <Home socket={socket}/>}/>
                    <Route path="/remoteGame" render={() => <RemoteGame socket={socket}/>}/>
                </Switch>
            </BrowserRouter> 
        )
    }
}

export {ClientRoutes, socket}