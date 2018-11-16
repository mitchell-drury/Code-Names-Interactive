const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const socketio = require('socket.io');
const db = require('./db/dbsetup.js');
const accountRouter = require('./routes/accountRouter');
const apiRouter = require('./routes/apiRouter');
const bodyParser = require('body-parser');
const sequelizeStore = require('connect-session-sequelize')(session.Store)

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var sessionMware = session({
    secret: 'somereallylong(*DHF$^!@?asdf;,F6^',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*60*60*24
    },
    store: new sequelizeStore({
        db: db
    })
})
app.use(sessionMware);

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user);
})
passport.deserializeUser(function(user, done) {
    done(null, user);
})

app.use(express.static(path.join(__dirname, '..', '/public')))
app.use('/account', accountRouter);
app.use('/api', apiRouter);
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'))
})

db.sync({force:false});
const server = app.listen(port, () => console.log('Ready to Whack \'em'));

const io = socketio(server);
require('../socket/socket.js')(io);
io.use(function(socket, next){
    sessionMware(socket.request, socket.request.res, next)
})