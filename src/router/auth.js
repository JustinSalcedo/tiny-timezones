const express = require('express')
const route = express.Router()

function auth(app) {
    app.use('/auth', route)

    route.post('/signup', (req, res) => {

    })
}

module.exports = auth