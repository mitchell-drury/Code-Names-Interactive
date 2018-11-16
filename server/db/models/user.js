const crypto = require('crypto')
const Sequelize = require('sequelize')
const db = require('../dbconnection.js');

const User = db.define('user', {
  username:{
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false 
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  salt: {
    type: Sequelize.STRING
  },
  isLoggedIn:{
    type: Sequelize.BOOLEAN
  },
  socket:{
    type:Sequelize.STRING
  },
  challengeStatus:{
    type:Sequelize.BOOLEAN,
    defaultValue:false
  },
  highScoreSingle:{
    type:Sequelize.INTEGER,
    defaultValue: 0
  },
  averageSingle:{
    type:Sequelize.VIRTUAL,
    set: function (val) {
      this.setDataValue('averageSingle', this.cumulativeScore/this.gamesPlayed)
    }
  },
  gamesPlayed:{
    type:Sequelize.INTEGER,
    defaultValue: 0
  },
  cumulativeScore:{
    type:Sequelize.INTEGER,
    defaultValue:0
  }
})

module.exports = User;

User.prototype.correctPassword = function (candidatePwd) {
  return User.encryptPassword(candidatePwd, this.salt) === this.password
}

User.generateSalt = function () {
  return crypto.randomBytes(16).toString('base64')
}

User.encryptPassword = function (plainText, salt) {
  return crypto
    .createHash('RSA-SHA256')
    .update(plainText)
    .update(salt)
    .digest('hex')
}

const setSaltAndPassword = user => { 
  if (user.changed('password')) {
    user.salt = User.generateSalt()
    user.password = User.encryptPassword(user.password, user.salt)
  }
}

User.beforeCreate(setSaltAndPassword)
User.beforeUpdate(setSaltAndPassword)
