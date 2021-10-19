const ContactModel = require('./model')

async function create(userId, contactDTO) {
    const { dataValues: contactRecord } = await ContactModel.create({
        ...contactDTO,
        userId
    })

    return contactRecord
}

async function createMany(userId, contactDTOs) {
    const parsedContactData = contactDTOs.map(contact => ({ ...contact, userId }))
    const contactRecords = await ContactModel.bulkCreate(parsedContactData, { validate: true })

    return contactRecords.map(record => record.dataValues)
}

async function findWhere(condition) {
    const contactRecords = await ContactModel.findAll({
        where: condition
    })

    return contactRecords.map(record => record.dataValues)
}

async function deleteWhere(condition) {
    return ContactModel.destroy({
        where: condition
    })
}

async function updateWhere(partialDTO, condition) {
    return ContactModel.update(partialDTO, {
        where: condition
    })
}

module.exports = {
    create,
    createMany,
    findWhere,
    deleteWhere,
    updateWhere
}