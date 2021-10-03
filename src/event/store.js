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

    const { dataValues: eventRecord } = eventRow
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

module.exports = {
    create,
    findWhere,
    deleteWhere,
    updateWhere
}