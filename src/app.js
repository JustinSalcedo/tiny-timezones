const path = require('path')
const cors = require('cors')

const config = require('./config')

const express = require('express')
const app = express()

const loader = require('./loader')

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

///////////////////

// const cluster = require('cluster')
// const os = require('os')

// const config = require('./config')
// const { createServer } = require('http')

// const express = require('express')

// const path = require('path')
// const cors = require('cors')

// const cpuCount = os.cpus().length

// async function startServer() {
//     const { port } = config

//     const app = express()

//     const httpServer = createServer(app)

//     if (cluster.isMaster) {
//         console.log(`Master ${process.pid} is running`)

//         for (let i = 0; i < cpuCount; i++) {
//             cluster.fork()
//         }

//         cluster.on('exit', worker => {
//             console.log(`Worker ${worker.process.pid} died`)
//             cluster.fork()
//         })
    
//         httpServer.on('error', onError)
//         httpServer.on('listening', onListening)
    
//         /* Event listener for HTTP server "error" event. */
        
//         function onError(error) {
//             if (error.syscall !== 'listen') {
//                 throw error
//             }
        
//             let bind = ''
//             if (typeof port === 'string') {
//                 bind = `Pipe ${port}`
//             } else {
//                 bind = `Port ${port}`
//             }
        
//             // handle specific listen errors with friendly messages
//             switch (error.code) {
//                 case "EACCES":
//                     console.error(bind + " requires elevated privileges")
//                     process.exit(1)
//                 case "EADDRINUSE":
//                     console.error(bind + " is already in use")
//                     process.exit(1)
//                 default:
//                     console.error(error)
//             }
//         }
        
//         /* Event listener for HTTP server "listening" event. */
        
//         function onListening() {
//             const address = httpServer.address()
//             const { debugNamespace } = config
//             let bind = ''
//             if (typeof address === 'string') {
//                 bind = `pipe ${address}`
//             } else {
//                 bind = `port ${address}`
//             }
        
//             if (process.env.NODE_ENV === 'development') {
//                 require('debug')(debugNamespace)(`Listening on ${address}`)
//                 console.info(`Server listening on port: ${port}`)
//             }
//         }
//     } else {
//         console.log(`Worker ${process.pid} started`)

//         const loader = require('./loader')

//         app.use(cors({
//             origin: '*'
//         }))

//         if (app.get('env') === 'production') {
//             app.set('trust proxy', 1)
//         }
        
//         app.use(express.json())
//         app.use(express.urlencoded({ extended: true }))
        
//         app.set('views', './src/views')
//         app.set('view engine', 'pug')
        
//         loader(app)
        
//         app.use('/', express.static(path.join(__dirname, '../public')))

//         httpServer.listen(port)
//     }
// }

// startServer()