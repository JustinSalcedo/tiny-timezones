const Sequelize = require('sequelize')
const db = require('../database')

const Contact = db.define('contact', {
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

module.exports = Contact