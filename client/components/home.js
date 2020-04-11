import React, {Component} from 'react';
import PlayOneScreen from './playOneScreen.js';
import CreateRemoteGame from './createRemoteGame.js';
import JoinRemoteGame from './joinRemoteGame.js';

export default class Home extends Component {
    constructor (props) {
        super (props);
    }

    render () {
        return (
            <div id='main'>
                <div id='homeScreenOptionsContainer'>
                    <PlayOneScreen />
                    <CreateRemoteGame />
                    <JoinRemoteGame />
                </div>
            </div>
        )
    }
}