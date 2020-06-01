const Sequelize = require('sequelize')
const db = require('../db')

const Room = db.define('room', {
  hash: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  }
})

module.exports = Room
