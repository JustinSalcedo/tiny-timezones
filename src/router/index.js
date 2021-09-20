const signup = require("./signup");
const auth = require("./auth")
const reactApp = require('./reactApp')

function loadRoutes(app) {

    const templateParams = {
        title: 'Hohooo',
        message: 'Isaaaaaa',
        reactEnv: (process.env.NODE_ENV === 'development') ? 'development' : 'production.min'
    }
    
    app.get('/', (req, res) => {
        res.render('index', templateParams)
    })

    signup(app)
    auth(app)
    reactApp(app)
}

module.exports = loadRoutes