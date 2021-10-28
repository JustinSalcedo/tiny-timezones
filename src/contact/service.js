const store = require('./store')
const { policy } = require('../config')

const { validateTimezone } = require('../utils')

async function createContact(userId, contactData) {
    if (policy.user.contactsLimit) {
        const contactsCount = await store.countWhere({ userId })
        if (contactsCount === policy.user.contactsLimit) {
            throw new Error('Limit of contacts per user reached')
        }
    }

    let { timezone, name } = contactData
    timezone = validateTimezone(timezone)

    const contactDTO = {
        name,
        timezone
    }

    return store.create(userId, contactDTO)
}

async function createManyContacts(userId, contactsData) {
    let checkedContactsData = contactsData

    if (policy.user.contactsLimit) {
        const contactsCount = await store.countWhere({ userId })
        if (contactsData.length + contactsCount > policy.user.contactsLimit) {
            if (contactsCount === policy.user.contactsLimit) {
                throw new Error('Limit of contacts per user reached')
            }
            checkedContactsData = contactsData.slice(0, (policy.user.contactsLimit - contactsCount))
        }
    }

    return store.createMany(userId, checkedContactsData.map(contactData => {
        let { timezone, name } = contactData
        timezone = validateTimezone(timezone)
    
        return { timezone, name }
    }))
}

async function findByUserId(userId) {
    return store.findWhere({
        userId
    })
}

async function updateOneContact(userId, contactId, contactData) {
    const contactDTO = { ...contactData }

    if (contactDTO.timezone) {
        contactDTO.timezone = validateTimezone(contactDTO.timezone)
    }

    const [ nRows ] = await store.updateWhere(contactDTO, {
        userId,
        id: contactId
    })

    if (nRows === 1) {
        return true
    } else if (nRows === 0) {
        return false
    } else throw new Error('More than one record were updated')
}

async function deleteOneContact(userId, contactId) {
    return store.deleteWhere({
        userId,
        id: contactId
    })
}

module.exports = {
    createContact,
    createManyContacts,
    findByUserId,
    updateOneContact,
    deleteOneContact
}