const api = require('./api')
const reactApp = require('./app')

const { author, domain, google } = require('../config')

function loadRoutes(app) {

    app.get('/', (req, res) => {
        const templateParams = {
            title: 'Tiny TimeZones',
            reactEnv: (process.env.NODE_ENV === 'development') ? 'development' : 'production.min',
            env: process.env.NODE_ENV,
            author,
            domain,
            googleId: google.clientId
        }

        res.render('index', templateParams)
    })

    app.get('/callback', (req, res) => {
        const templateParams = {
            title: 'Tiny TimeZones',
        }

        res.render('callback', templateParams)
    })

    api(app)
    reactApp(app)
}

module.exports = loadRoutes