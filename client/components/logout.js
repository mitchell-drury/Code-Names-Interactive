import React, {Component} from 'react';
import Axios from 'Axios';

export default class Logout extends Component {
    constructor (props) {
        super ();

        this.logout = this.logout.bind(this, props.setLoggedIn);
    }

    logout (setLoggedIn) {
        Axios.post('/account/logout')
        .then(function(response) {
            setLoggedIn();
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