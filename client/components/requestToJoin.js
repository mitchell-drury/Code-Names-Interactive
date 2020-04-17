import React, {Component} from 'react';

export default class RequestToJoin extends Component {
    constructor (props) {
        super (props);

        this.state = {
        }
    }

    render() {
        return(
            <li className='request'> 
                {this.props.request.name} <span className='acceptRequest' onClick={this.props.acceptRequest.bind(null, this.props.request)}> &#x2714; </span><span className='denyRequest' onClick={this.props.denyRequest.bind(null, this.props.request)}> X </span>
            </li>
        )
    }


}