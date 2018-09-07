import React, {Component} from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import PlayModes from './playModes.js';
import Login from './login.js';
import Logout from './logout.js';
import Axios from 'Axios';

export default class Home extends Component {
    constructor () {
        super ()
        this.state = {
            isLoggedIn: false
        }

        this.setLoggedIn = this.setLoggedIn.bind(this);
    }

    componentDidMount () {
        this.setLoggedIn();
    }

    setLoggedIn () {
        Axios.post('/account/authenticate')
        .then(isLoggedIn => {
            this.setState({isLoggedIn: isLoggedIn.data})
        })
    }

    render () {
        if (!this.state.isLoggedIn) {
            return (
                <div id="home"> 
                    <PlayModes> </PlayModes>
                    <Login setLoggedIn={this.setLoggedIn}> </Login>
                </div>
            )
        } else {
            return (
                <div id="home"> 
                    <PlayModes> </PlayModes>
                    <Logout setLoggedIn={this.setLoggedIn}> </Logout>
                </div>                
            )
        }
    }
} 