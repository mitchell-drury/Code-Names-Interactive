import React, {Component} from 'react';
import Cell from './cell';

export default class Row extends Component {
    constructor (props) {
        super (props);
    }

    render () {
        let rowNumber = this.props.rowNumber;
        let row = <div className='row'>
            {this.props.cells.map((cell, index) => {
                return <Cell cellNumber={rowNumber*5 + index} key={index} mole={cell} whackMole={this.props.whackMole} />
            })}
        </div>
        return (
            row
        )
    }

}