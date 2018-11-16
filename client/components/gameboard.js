import React, {Component} from 'react';

export default class Gameboard extends Component {
    constructor (props) {
        super (props)
    }

    componentWillUnmount () {
        //notify opponent of victory
        if (this.props.socket) {
            this.props.socket.emit('won')
        }
    }

    render () {
        const numbers = [];
        for (let x = 0; x < 5; x++){
            numbers.push(x);
        }
        return (
            <div id='gameboard'> 
            {
                numbers.map(row => {
                    return <div key={row} className='row'> 
                    {
                        numbers.map(cell => {
                            if (this.props.openSpaces.indexOf(row*5 + cell) < 0) {
                                return (
                                    <div key={row*5+cell} cellid={row*5+cell} className='cell mole' onClick={this.props.whackMole}></div>
                                )
                            } else {
                                return (
                                    <div key={row*5+cell} cellid={row*5+cell}className='cell'></div>
                                )
                            }
                        })
                    } 
                    </div>
                })
            }
            </div>
        )
    }
} 