import React, {Component} from 'react';

export default class challenges extends Component {
    constructor (props) {
        super (props)

        this.state = {
            challengeExtended: false,
            opponentText: '',
            challenge: '',
            challenger:''
        }

        this.handleOpponentText = this.handleOpponentText.bind(this);
        this.sendChallenge = this.sendChallenge.bind(this);
        this.rescindChallenge = this.rescindChallenge.bind(this);
        this.acceptChallenge = this.acceptChallenge.bind(this);
        this.handleChallengerChange = this.handleChallengerChange.bind(this);
    }

    componentDidMount () {
        this.props.socket.on('challengeSent', challenge => {
            this.setState({
                challengeExtended: true,
                challenge: challenge,
                opponentText: '',
                challenger: ''
            })
        })
    }

    componentWillUnmount () {
        this.props.socket.emit('rescindChallenge', this.state.challenge)
    }

    handleOpponentText (event) {
        this.setState({opponentText: event.target.value})
    }

    sendChallenge () {
        this.props.socket.emit('challenge', this.state.opponentText.trim().toLowerCase());
    }

    rescindChallenge () {
        this.props.socket.emit('rescindChallenge', this.state.challenge)
        this.setState({
            challengeExtended: false,
            challenge: ''
        })
    }

    handleChallengerChange (event) {
        this.setState({
            challenger: event.target.value
        })
    }

    acceptChallenge () {
        //check to make sure at least a challenger has been selected
        if (this.state.challenger != ''){
            this.props.socket.emit('challengeAccepted', this.state.challenger)
        }
    }

    render () {
        if (this.state.challengeExtended){
            return (
                <div>
                    Awaiting opponent
                    <button type='submit' className='button' onClick={this.rescindChallenge} > Rescind Challenge </button>
                </div>
            )
        } else {
            return (
                <div id='challenges'>
                    <input className='search' type='text' placeholder='Opponent user name' onChange={this.handleOpponentText}/>
                
                    <button type='submit' className='button' onClick={this.sendChallenge} > Send Challenge 
                    </button>
                    <div>
                        <select id='challengerList' size={10} onChange={this.handleChallengerChange}>
                            <option disabled>Challengers</option>
                            {this.props.challengers.map((challenger, i) => {
                                return (<option key={i}> {challenger} </option>);
                            })}
                        </select>
                        <button type='submit' className='button' onClick={this.acceptChallenge}>
                            Accept Challenge
                        </button>
                    </div>
                </div>
            )
        }
    }

}