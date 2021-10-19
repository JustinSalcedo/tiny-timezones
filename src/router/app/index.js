const express = require('express')
const route = express.Router()

function ReactApp(expressApp) {
    expressApp.use('/app', route)

    const templateParams = {
        title: 'Tiny TimeZones',
        reactEnv: (process.env.NODE_ENV === 'development') ? 'development' : 'production.min',
        env: process.env.NODE_ENV
    }

    route.get('', (req, res) => {
        res.render('app', templateParams)
    })
}

module.exports = ReactApp