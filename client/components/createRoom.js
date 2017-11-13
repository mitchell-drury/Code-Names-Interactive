import React, {Component} from 'react';

export default class CreateRoom {
    constructor (props) {
        super(props);
    }

    render () {
        return (
            <div>
                <form id='room-name'>
                    <input name='room-name' type='text' />
                </form>
            </div>
        )
    }
}