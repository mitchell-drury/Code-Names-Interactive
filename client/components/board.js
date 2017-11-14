import React, {Component} from 'react';
import Cell from './cell';
import Row from './row';

export default class Board extends Component {
    constructor (props) {
        super (props);
    }

    render () {
        return (           
            <div id='board'>
                {this.props.moleLocations.map((row, index) => {
                   return (
                       <Row rowNumber={index} key={index} cells={this.props.moleLocations[index]} whackMole={this.props.whackMole}/>
                   )
                })}
                
           </div>
        )
    }
}