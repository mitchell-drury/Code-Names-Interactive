import React, {Component} from 'react';
import PlayModes from './playModes.js';
import Login from './login.js';
import Logout from './logout.js';

export default class Home extends Component {
    constructor (props) {
        super (props)
    }

    componentDidMount () {
    }

    render () {
        if (!this.props.loggedIn) {
            return (
                <div id="home"> 
                    <PlayModes> </PlayModes>
                    <Login setLoggedInStatus={this.props.setLoggedInStatus} socket={this.props.socket}> </Login>
                </div>
            )
        } else {
            return (
                <div id="home"> 
                    <PlayModes> </PlayModes>
                    <Logout setLoggedInStatus={this.props.setLoggedInStatus}> </Logout>
                </div>                
            )
        }
    }
} 