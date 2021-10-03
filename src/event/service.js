const store = require('./store')

const { validateTimezone } = require('../utils')

async function createEvent(userId, eventData) {
    let { timezone, name, timestamp, reminder, contactIds } = eventData
    timezone = validateTimezone(timezone)
    reminder = !!reminder

    const eventDTO = {
        name,
        timezone,
        timestamp,
        reminder,
        contactIds
    }

    const eventRecord = await store.create(userId, eventDTO)
    return parseContactIds(eventRecord)
}

async function findByUserId(userId) {
    const eventRecords = await store.findWhere({
        userId
    })

    return eventRecords.map(eventRecord => parseContactIds(eventRecord))
}

async function updateOneEvent(userId, eventId, eventData) {
    const eventDTO = { ...eventData }

    if (eventDTO.timezone) {
        eventDTO.timezone = validateTimezone(eventDTO.timezone)
    }

    const [ nRows ] = await store.updateWhere(eventDTO, {
        userId,
        id: eventId
    })

    if (nRows === 1) {
        return true
    } else if (nRows === 0) {
        return false
    } else throw new Error('More than one record were updated')
}

async function deleteOneEvent(userId, eventId) {
    return store.deleteWhere({
        userId,
        id: eventId
    })
}

function parseContactIds(eventRecord) {
    const parsedRecord = {...eventRecord}

    if (eventRecord.contacts && eventRecord.contacts.length > 0 ) {
        Reflect.deleteProperty(parsedRecord, 'contacts')
        return {
            ...parsedRecord,
            contactIds: eventRecord.contacts.map(contact => contact.dataValues.id)
        }
    }

    return parsedRecord
}

module.exports = {
    createEvent,
    findByUserId,
    updateOneEvent,
    deleteOneEvent
}