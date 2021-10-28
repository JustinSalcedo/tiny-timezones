const store = require('./store')
const { policy } = require('../config')

const { validateTimezone } = require('../utils')

async function createEvent(userId, eventData) {
    if (policy.user.eventsLimit) {
        const eventsCount = await store.countWhere({ userId })
        if (eventsCount === policy.user.eventsLimit) {
            throw new Error('Limit of events per user reached')
        }
    }

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

async function createManyEvents(userId, eventsData) {
    let checkedEventsData = eventsData

    if (policy.user.eventsLimit) {
        const eventsCount = await store.countWhere({ userId })
        if (eventsData.length + eventsCount > policy.user.eventsLimit) {
            if (eventsCount === policy.user.eventsLimit) {
                throw new Error('Limit of events per user reached')
            }
            checkedEventsData = eventsData.slice(0, (policy.user.eventsLimit - eventsCount))
        }
    }

    const eventRecords = await store.createMany(userId, eventsData.map(eventData => {
        let { timezone, name, timestamp, reminder, contactIds } = eventData
        timezone = validateTimezone(timezone)
        reminder = !!reminder
    
        return {
            name,
            timezone,
            timestamp,
            reminder,
            contactIds
        }
    }))

    return eventRecords.map(record => parseContactIds(record))
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
    createManyEvents,
    findByUserId,
    updateOneEvent,
    deleteOneEvent
}