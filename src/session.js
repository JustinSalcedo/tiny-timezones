const Sequelize = require('sequelize')
const db = require('./database')

db.define('Session', {
    sid: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    userId: Sequelize.STRING,
    expires: Sequelize.DATE,
    data: Sequelize.TEXT
})

function extendDefaultFields(defaults, session) {
    return {
        data: defaults.data,
        expires: defaults.expires,
        userId: session.userId
    }
}

module.exports = extendDefaultFields