const Sequelize = require('sequelize')
const db = require('../database')

const Clock = db.define('clock', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    timezone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

module.exports = Clock