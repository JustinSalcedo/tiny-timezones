const path = require('path')
const cors = require('cors')

const config = require('./config')

const express = require('express')
const app = express()

const loader = require('./loader')

// const cookieSession = require('cookie-session')
// const Keygrip = require('keygrip')

app.use(cors({
    origin: '*'
}))

if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('views', './src/views')
app.set('view engine', 'pug')

loader(app)

app.use('/', express.static(path.join(__dirname, '../public')))

app.listen(config.port, () => {
    console.log('Listening on port ' + config.port)
})