import React, {Component} from 'react';
import { Route, Switch, Link } from 'react-router-dom';

export default class PlayModes extends Component {
    constructor () {
        super ()
    }

    render () {
        return (
            <div id="playModes">
                <Link className="button" to="/singleplayer"> Single Player </Link>
                <Link className="button" to="/twoplayer"> Two Player </Link>
            </div>
        )
    }
} 