const express = require('express');
const accountRouter = express.Router();
const User = require('../db/models/user.js')
const Op = require('sequelize').Op;

accountRouter.post('/login', function(req, res, next) {
    User.findOne({where: {
        username:{
            [Op.eq]:req.body.username.toLowerCase()
        }
    }})
    .then(user => {
        if (!user) {
            res.send({error: 'No such user'})
        } else if (!user.correctPassword(req.body.password)) {
            res.send({error: 'Incorrect password'})
        } else {
            req.login(user, err => (err ? next(err) : res.json(user)))
        }
    })
})

accountRouter.post('/signup', function(req, res, next) {
    User.create({
        username:req.body.username.toLowerCase(),
        password:req.body.password
    })
    .then(user => {
        req.login(user, err => (err ? next(err) : res.json(user)))
    })
    .catch(err => {
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.send({error: 'User already exists'})
        } else {
            res.send({'error': 'There was a deep problem, and we\'re working on it :)'})
            console.log(err)
        }
    })
})

accountRouter.post('/authenticate', function(req, res, next) {
    if (req.user) {
        res.send({userLoggedIn: true})
    } else {
        res.send({userLoggedIn: false});
    }
})

accountRouter.post('/logout', function(req, res, next){
    console.log('logout req:', req.user)
    req.logout();
    req.session.destroy();
    res.redirect('/');
})

accountRouter.post('/update', function(req, res, next){
    User.update(
        {socket: req.socket},
        {where: {username: {
            [Op.eq]:req.user.username
        }}}
    )
})

module.exports = accountRouter;