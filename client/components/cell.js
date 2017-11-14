import React, {Component} from 'react';

export default class Cell extends Component {
    constructor (props) {
        super (props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick () {
        if (this.props.mole) {
            this.props.whackMole(this.props.cellNumber);
        }
    }

    render () {
        return (
            this.props.mole ? 
            <div className='cell mole' onClick={this.handleClick}>
            </div>
            :
            <div className='cell' onClick={this.handleClick}>
            </div>
        )
    }
}