import React, {Component} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Home from './home.js';
import RemoteGame from './remoteGame';
import io from 'socket.io-client';

const socket = io();

socket.on('connect', () => {
    console.log('Connected!, My Socket Id:', socket.id)
})

class ClientRoutes extends Component {
    constructor () {
        super ();
    }


    render () {
        return (
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