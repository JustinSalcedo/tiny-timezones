const path = require('path')
const cors = require('cors')

const config = require('./config')

const express = require('express')
const app = express()

const loadRoutes = require('./router')

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('views', './src/views')
app.set('view engine', 'pug')

loadRoutes(app)

app.use('/components', express.static(path.join(__dirname, './components/rendered')))
app.use('/styles', express.static(path.join(__dirname, './styles')))
app.use('/assets', express.static(path.join(__dirname, './assets')))

app.listen(config.port, () => {
    console.log('Listening on port ' + config.port)
})