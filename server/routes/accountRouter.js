const express = require('express');
const accountRouter = express.Router();
const User = require('../db/models/user.js')
const Op = require('sequelize').Op;
// const passport = require('passport');
// const LocalStrategy = require('passport-local');

accountRouter.post('/login', function(req, res, next) {
    User.findOne({where: {
        username:{
            [Op.eq]:req.body.username
        }
    }})
    .then(user => {
        if (!user) {
            res.send('User not found')
        } else if (!user.correctPassword(req.body.password)) {
            res.send('Incorrect Password')
        } else {
            user.update({
                isLoggedIn:true
            })
            req.login(user, err => (err ? next(err) : res.json(user)))
        }
    })
})

accountRouter.post('/signup', function(req, res, next) {
    User.create({
        username:req.body.username,
        password:req.body.password,
        isLoggedIn: true
    })
    .then(user => {
        req.login(user, err => (err ? next(err) : res.json(user)))
    })
    .catch(err => {
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.send('User already exists')
        } else if (err.name === 'SequelizeValidationError') {
            res.send('Invalid Email Address')
        } else {
            console.log(err)
        }
    })
})

accountRouter.post('/authenticate', function(req, res, next) {
    console.log(req.user);
    if (req.user) {
        res.send(true)
    } else {
        console.log('flase');
        res.send(false);
    }
})

accountRouter.post('/logout', function(req, res, next){
    console.log('logout req:', req.user)
    User.findOne({where: 
        {username:
            {[Op.eq]:req.user.username}
        }
    })
    .then(user => {
        user.update({
            isLoggedIn: false
        })
    });
    req.logout();
    req.session.destroy();
    res.redirect('/');
})

accountRouter.post('/updateChallengeStatus', function(req, res, next){
    console.log('status: ', req.challengeStatus)
    User.update(
        {challengeStatus: req.challengeStatus},
        {where: {username: {
            [Op.eq]:req.user.username
        }}}
    )
})

module.exports = accountRouter;