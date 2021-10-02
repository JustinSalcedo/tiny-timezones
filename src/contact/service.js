const store = require('./store')
const moment = require('moment')

const config = require('../config')

function createContact(userId, contactData) {
    let { timezone, name } = contactData
    // console.log('current timezone is %s\n and all timezones are %o\n', timezone, moment.tz.names())
    if (!timezone || !moment.tz.names().includes(timezone)) {
        timezone = config.defaultTimezone
    }

    const contactDTO = {
        name,
        timezone
    }

    return store.create(userId, contactDTO)
}

module.exports = {
    createContact
}