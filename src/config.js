const dotenv = require('dotenv')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const envFound = dotenv.config()
if (envFound.error) {
    throw new Error("Couldn't find .env file")
}

module.exports = {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT, 10),
    debugNamespace: process.env.DEBUG_NAMESPACE,
    domain: process.env.DOMAIN || 'http://localhost:' + parseInt(process.env.PORT, 10),
    defaultTimezone: 'UTC',
    instance: process.env.INSTANCE || 'standalone',
    cookieSecrets: [
        process.env.CK_SCRT_1,
        process.env.CK_SCRT_2
    ],
    session: {
        maxAgeInMs: parseInt(process.env.SESSION_MAX_AGE, 10),
        checkExpInterval: 15 * 60 * 1000
    },
    database: {
        host: process.env.POSTGRESQL_HOST,
        user: process.env.POSTGRESQL_USER,
        password: process.env.POSTGRESQL_PASSWORD,
        name: process.env.POSTGRESQL_DB_NAME,
        uri: process.env.POSTGRESQL_URI
    },
    author: {
        name: process.env.AUTHOR_NAME,
        website: process.env.AUTHOR_WEBSITE,
        github: process.env.AUTHOR_GITHUB,
        twitter: process.env.AUTHOR_TWITTER,
        linkedin: process.env.AUTHOR_LINKEDIN,
        sourceUrl: process.env.AUTHOR_SOURCE_URL
    },
    policy: {
        user: {
            clocksLimit: parseInt(process.env.POLICY_USER_CLOCKS_LIMIT, 10),
            contactsLimit: parseInt(process.env.POLICY_USER_CONTACTS_LIMIT, 10),
            eventsLimit: parseInt(process.env.POLICY_USER_EVENTS_LIMIT, 10)
        },
        guest: {
            clocksLimit: parseInt(process.env.POLICY_GUEST_CLOCKS_LIMIT, 10),
            contactsLimit: parseInt(process.env.POLICY_GUEST_CONTACTS_LIMIT, 10),
            eventsLimit: parseInt(process.env.POLICY_GUEST_EVENTS_LIMIT, 10)
        }
    },
    providerTags: ['google'],
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID
    }
}