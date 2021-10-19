const db = require('./database')

const User = require('./user/model')
const Clock = require('./clock/model')
const Contact = require('./contact/model')
const Event = require('./event/model')

const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const extendDefaultFields = require('./session')

const loadRoutes = require('./router')
const config = require('./config')

async function loader(app) {
    try {
        // Database
        await db.authenticate()
        console.log('Database connected...')

        User.hasMany(Clock, {
            onDelete: 'CASCADE'
        })
        Clock.belongsTo(User)
        
        User.hasMany(Contact, {
            onDelete: 'CASCADE'
        })
        Contact.belongsTo(User)

        User.hasMany(Event, {
            onDelete: 'CASCADE'
        })
        Event.belongsTo(User)

        Contact.belongsToMany(Event, { through: 'EventContacts' })
        Event.belongsToMany(Contact, { through: 'EventContacts' })

        // Session middleware
        const sessionOptions = {
            name: 'ttz.sid',
            secret: config.cookieSecrets,
            store: new SequelizeStore({
                db: db,
                table: "Session",
                extendDefaultFields,
                checkExpirationInterval: config.session.checkExpInterval,
                expiration: config.session.checkExpInterval
            }),
            resave: false,
            saveUninitialized: true,
            cookie: {}
        }

        if (app.get('env') === 'production') {
            sessionOptions.cookie.secure = true
            sessionOptions.proxy = true
        }

        app.use(session(sessionOptions))

        await db.sync({ force: true })
        console.log('Sessions up...')

        // Routes
        loadRoutes(app)
    } catch (error) {
        console.log('Error: ' + error)
    }
}

module.exports = loader