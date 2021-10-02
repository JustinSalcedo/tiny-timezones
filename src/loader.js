const db = require('./database')
const loadRoutes = require('./router')

const User = require('./user/model')
const Clock = require('./clock/model')
const Contact = require('./contact/model')
const Event = require('./event/model')

async function loader(app) {
    try {
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

        await db.sync({ force: true })

        loadRoutes(app)
    } catch (error) {
        console.log('Error: ' + error)
    }
}

module.exports = loader