const express = require('express')
const route = express.Router()

const auth = require('./auth')
const contact = require('./contact')

function api(app) {
    app.use('/api', route)

    auth(route)
    contact(route)
}

module.exports = api