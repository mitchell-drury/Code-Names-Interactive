const express = require('express');
const apiRouter = express.Router();
const User = require('../db/models/user.js')
const Op = require('sequelize').Op;



module.exports = apiRouter;