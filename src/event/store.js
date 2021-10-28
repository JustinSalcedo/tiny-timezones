const { Op } = require('sequelize')

const EventModel = require('./model')
const ContactModel = require('../contact/model')

async function create(userId, eventDTO) {
    const { name, timezone, timestamp, reminder, contactIds } = eventDTO

    const eventRow = await EventModel.create({
        name,
        timezone,
        timestamp,
        reminder,
        userId
    })

    if (contactIds && contactIds.length > 0) {
        return createWithContacts(eventRow, contactIds)
    }

    const { dataValues: eventRecord } = eventRow
    return eventRecord
}

async function createMany(userId, eventDTOs) {
    const noContactsDTOs = eventDTOs
        .filter(event => (!event.contactIds || event.contactIds.length === 0))
        .map(({ name, timezone, timestamp, reminder }) => ({
            name,
            timezone,
            timestamp,
            reminder,
            userId
        }))

    if (noContactsDTOs.length === eventDTOs.length) {
        const eventRecords = await EventModel.bulkCreate(noContactsDTOs, { validate: true })
        return eventRecords.map(record => record.dataValues)
    } else {
        const withContactDTOs = eventDTOs
            .filter(event => (event.contactIds && event.contactIds.length > 0))
            .map(({ name, timezone, timestamp, reminder, contactIds }) => ({
                name,
                timezone,
                timestamp,
                reminder,
                contactIds
            }))

        const withContactRecords = await Promise.all(withContactDTOs.map(async eventDTO => await create(userId, eventDTO)))
        const noContactRecords = (await EventModel.bulkCreate(noContactsDTOs, { validate: true }))
            .map(record => record.dataValues)

        return withContactRecords.concat(noContactRecords)
    }
}

async function createWithContacts(eventRow, contactIds) {
    const contactRows = await ContactModel.findAll({
        where: {
            id: {
                [Op.or]: contactIds
            }
        }
    })

    await eventRow.addContacts(contactRows)
    const { dataValues: eventRecord } = await EventModel.findByPk(eventRow.dataValues.id, {
        include: {
            model: ContactModel,
            attributes: ['id']
        }
    })

    return eventRecord
}

async function findWhere(condition) {
    const eventRecords = await EventModel.findAll({
        where: condition,
        include: {
            model: ContactModel,
            attributes: ['id']
        }
    })

    return eventRecords.map(record => record.dataValues)
}

async function deleteWhere(condition) {
    return EventModel.destroy({
        where: condition
    })
}

async function updateWhere(partialDTO, condition) {
    const { contactIds } = partialDTO
    let nRowsByContacts = 0
    if (contactIds && contactIds.length > 0) {
        const eventRow = await EventModel.findOne({
            where: condition
        })

        const contactRows = await ContactModel.findAll({
            where: {
                id: {
                    [Op.or]: contactIds
                }
            }
        })

        await eventRow.setContacts(contactRows)
        nRowsByContacts = 1
    }

    const updatableDTO = {...partialDTO}
    Reflect.deleteProperty(updatableDTO, 'contactIds')
    const [ nRows ] = await EventModel.update(updatableDTO, {
        where: condition
    })

    if (nRowsByContacts === nRows) return [ nRows ]
    if (nRowsByContacts + nRows === 1) return [ 1 ]
    return [ nRows ]
}

async function countWhere(condition) {
    return EventModel.count({
        where: condition
    })
}

module.exports = {
    create,
    createMany,
    findWhere,
    deleteWhere,
    updateWhere,
    countWhere
}