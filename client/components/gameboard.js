import React, {Component} from 'react';

export default class Gameboard extends Component {
    constructor (props) {
        super (props)
    }

    componentWillUnmount () {
        //notify opponent of victory (if they navigate away from page)
        if (this.props.socket) {
            this.props.socket.emit('youWon')
        }
    }

    render () {
        const numbers = [];
        for (let x = 0; x < 5; x++){
            numbers.push(x);
        }

        if (this.props.whackable){
        return (
            <div id='gameboard'> 
            {
                numbers.map(row => {
                    return <div key={row} className='row'> 
                    {
                        numbers.map(cell => {
                            if (row*5 + cell === this.props.wormSpace) {
                                return (
                                    <div key={row*5+cell} cellid={row*5+cell} className='cell worm' onClick={this.props.whackWorm}>
                                    </div>           
                                )
                            }
                            else if (this.props.openSpaces.indexOf(row*5 + cell) < 0) {
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
        } else {
            return (
                <div className='wormWarning'> Don't hurt the worms!</div>
            )
        }
    }
} 