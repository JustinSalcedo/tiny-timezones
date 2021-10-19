const express = require('express')
const route = express.Router()

const auth = require('./auth')
const clock = require('./clock')
const contact = require('./contact')
const event = require('./event')
const user = require('./user')

function api(app) {
    app.use('/api', route)

    auth(route)
    clock(route)
    contact(route)
    event(route)
    user(route)
}

module.exports = api