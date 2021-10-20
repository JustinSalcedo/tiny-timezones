const Sequelize = require('sequelize')
const { database } = require('./config')

module.exports = new Sequelize(database.name, database.user, database.password, {
    host: database.host,
    dialect: 'postgres',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})