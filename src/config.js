const dotenv = require('dotenv')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const envFound = dotenv.config()
if (envFound.error) {
    throw new Error("Couldn't find .env file")
}

module.exports = {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT, 10),
    domain: process.env.DOMAIN || 'http://localhost:' + parseInt(process.env.PORT, 10),
    defaultTimezone: 'America/Los_Angeles',
    instance: process.env.INSTANCE || 'standalone',
    cookieSecrets: [
        process.env.CK_SCRT_1,
        process.env.CK_SCRT_2
    ],
    database: {
        user: process.env.POSTGRESQL_USER,
        password: process.env.POSTGRESQL_PASSWORD,
        name: process.env.POSTGRESQL_DB_NAME,
        uri: process.env.POSTGRESQL_URI
    },
    providerTags: ['google'],
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID
    }
}