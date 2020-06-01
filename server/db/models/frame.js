const Sequelize = require('sequelize')
const db = require('../db')

const Frame = db.define('frame', {
  frameNumber: {
    type: Sequelize.INTEGER
  },
  list: {
    type: Sequelize.JSON,
  }
})

module.exports = Frame
