import React, {Component} from 'react';
import Axios from 'Axios';

export default class Logout extends Component {
    constructor (props) {
        super (props);

        this.logout = this.logout.bind(this);
    }

    logout () {
        Axios.post('/account/logout')
        .then(() =>  {
            this.props.setLoggedInStatus(false);
        });
    }

    render () {
        return (
            <div id='logout' className='button' onClick={this.logout}>
                Logout
            </div>
        )
    }
}