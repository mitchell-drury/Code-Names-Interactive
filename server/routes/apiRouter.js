const express = require('express');
const apiRouter = express.Router();
const User = require('../db/models/user.js')
const Op = require('sequelize').Op;

apiRouter.post('/endgame', function(req, res, next) {
    if (req.user) {
        console.log(req.user);
        User.findOne({where: {
            username:{
                [Op.eq]:req.user.username
            }
        }})
        .then(user => {
            if (req.body.score > user.highScoreSingle) {
                user.update({
                    highScoreSingle: req.body.score,
                    gamesPlayed: user.gamesPlayed + 1,
                    cumulativeScore: user.cumulativeScore + req.body.score
                })
            } else {
                user.update({
                    gamesPlayed: user.gamesPlayed + 1,
                    cumulativeScore: user.cumulativeScore + req.body.score
                })
            }
            res.json(user);
        })
    } else {
        res.send(false)
    }
})


module.exports = apiRouter;