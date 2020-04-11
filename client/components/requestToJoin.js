import React, {Component} from 'react';
import {socket} from './clientRoutes.js';

export default class RequestToJoin extends Component {
    constructor (props) {
        super (props);

        this.state = {
            //request:{socket: props.socketId}
        }
    }

    render() {
        return(
            <li className='request'> 
                {this.props.request.name} <span className='acceptRequest' onClick={this.props.acceptRequest.bind(null, this.props.request.requestingSocket)}> &#x2714; </span><span className='denyRequest' onClick={this.props.denyRequest.bind(null, this.props.request.requestingSocket)}> X </span>
            </li>
        )
    }


}