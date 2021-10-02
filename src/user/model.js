const Sequelize = require('sequelize')
const db = require('../database')

const User = db.define('user', {
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    openid_provider_tag: {
        type: Sequelize.STRING,
        allowNull: false
    },
    openid_provider_sub: {
        type: Sequelize.STRING,
        allowNull: false
    },
    openid_provider_picture: {
        type: Sequelize.STRING
    },
    openid_provider_exp: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    openid_provider_lang: {
        type: Sequelize.STRING
    }
}, {
    indexes: [
        {
            name: 'idx_open_id',
            using: 'BTREE',
            fields: ['openid_provider_tag', 'openid_provider_sub']
        }
    ]
})

module.exports = User