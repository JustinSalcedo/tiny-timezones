const Sequelize = require('sequelize')
const db = require('../database')

const Event = db.define('event', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    timestamp: {
        type: Sequelize.DATE,
        allowNull: false
    },
    timezone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    reminder: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    // contact_ids: {
    //     type: Sequelize.ARRAY(Sequelize.INTEGER)
    // },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

module.exports = Event