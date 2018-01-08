const Sequelize = require('sequelize')
const db = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost:5432/moles', {
    logging: false
  }
)

const User = db.define('user', {
    wins: Sequelize.INTEGER,
    losses: Sequelize.INTEGER,
    password: Sequelize.STRING,
    salt: Sequelize.STRING
})


module.exports = {
    db, User
}