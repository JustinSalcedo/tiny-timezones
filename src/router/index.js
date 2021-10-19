const api = require('./api')
const reactApp = require('./app')

const { author } = require('../config')

function loadRoutes(app) {

    app.get('/', (req, res) => {
        const templateParams = {
            title: 'Tiny TimeZones',
            reactEnv: (process.env.NODE_ENV === 'development') ? 'development' : 'production.min',
            author
        }

        res.render('index', templateParams)
    })

    app.get('/callback', (req, res) => {
        const templateParams = {
            title: 'Tiny TimeZones'
        }

        res.render('callback', templateParams)
    })

    api(app)
    reactApp(app)
}

module.exports = loadRoutes