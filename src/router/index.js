const api = require('./api')
const reactApp = require('./app')

function loadRoutes(app) {

    app.get('/', (req, res) => {
        const templateParams = {
            title: 'Tiny TimeZones',
            reactEnv: (process.env.NODE_ENV === 'development') ? 'development' : 'production.min'
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