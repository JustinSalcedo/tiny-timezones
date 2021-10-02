const express = require('express')
const route = express.Router()

function ReactApp(expressApp) {
    expressApp.use('/app', route)

    const templateParams = {
        title: 'Hohooo',
        reactEnv: (process.env.NODE_ENV === 'development') ? 'development' : 'production.min'
    }

    route.get('', (req, res) => {
        res.render('app', templateParams)
    })
}

module.exports = ReactApp