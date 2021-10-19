const store = require('./store')

const { validateTimezone } = require('../utils')

async function createContact(userId, contactData) {
    let { timezone, name } = contactData
    timezone = validateTimezone(timezone)

    const contactDTO = {
        name,
        timezone
    }

    return store.create(userId, contactDTO)
}

async function createManyContacts(userId, contactsData) {
    return store.createMany(userId, contactsData.map(contactData => {
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