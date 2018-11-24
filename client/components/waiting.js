import React, {Component} from 'react';

export default class Waiting extends Component {
    constructor (props) {
        super (props)

        this.leaveWaitingRoom = this.leaveWaitingRoom.bind(this);
    }

    componentDidMount () {
        this.props.socket.emit('joinWaiting');
    }

    componentWillUnmount () {
        //deal with removing from waitlist
    }

    leaveWaitingRoom () {
        this.props.setGameState('inactive', 'Welcome to the Yard');
        this.props.socket.emit('leaveWaiting');
    }

    render () {
        return (
            <div id="waiting">
                <div className='message'> Waiting for an opponent to match.
                </div>
                <div className='button' onClick={this.leaveWaitingRoom}>
                    Quit
                </div>
            </div>
        )
    }
} 