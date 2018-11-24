import React, {Component} from 'react';
import Axios from 'Axios';

export default class Login extends Component {
    constructor (props) {
        super (props);
        this.state = {
            username: '',
            password: '',
            loginSignupMessage: ''
        }

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this, props.socket);
        this.handleSignup = this.handleSignup.bind(this, props.socket);
    }

    handleUsernameChange (event) {
        event.preventDefault();
        this.setState({username: event.target.value});
    }

    handlePasswordChange (event) {
        event.preventDefault();
        this.setState({password: event.target.value});
    }

    handleLogin (socket, event) {
        event.preventDefault();
        if (this.state.username != '' && this.state.password != '') {
            Axios.post('/account/login', {
                username: this.state.username.trim(),
                password: this.state.password.trim()
            }).then(response => {
                console.log('login: ', response)
                if (response.data.error) {
                    this.setState({loginSignupMessage: response.data.error});
                }                
                if (response.data.username) {
                    socket.emit('login', response.data.username)
                    this.props.setLoggedInStatus(true)
                }
            }) 
        }       
    }

    handleSignup (socket, event) {
        event.preventDefault();
        if (this.state.username != '' && this.state.password != '') {
            Axios.post('/account/signup', {
                username: this.state.username.trim(),
                password: this.state.password.trim()
            }).then(response => {
                console.log('create message:', response);
                if (response.data.error) {
                    this.setState({loginSignupMessage: response.data.error})
                }                
                if (response.data.username) {
                    socket.emit('login', response.data.username)
                }           
            })
        }
    }

    componentDidMount () {
        console.log('login props: ', this.props)
    }

    render () {
        return (
            <div id="account">
                <form>
                    <input id="username" type="text" name="name" placeholder="Email" onChange={this.handleUsernameChange}/>
                    <input id="password" type="password" name="password" placeholder="Password" onChange={this.handlePasswordChange}/>
                    <button id="login" className='button' type="submit" onClick={this.handleLogin}> Login </button>
                    <button id="signup" className='button' type="submit" onClick={this.handleSignup}> Signup </button>
                </form>
                <div id='loginMessage'>
                    {this.state.loginMessage}
                </div>
            </div>
        )
    }
} 