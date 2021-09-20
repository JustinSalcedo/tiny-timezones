const express = require('express')
const route = express.Router()

function signup(app) {
    app.use('/signup', route)

    route.get('', (req, res) => {
        res.render('signup')
    })
}

module.exports = signup