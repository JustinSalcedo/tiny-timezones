const ContactModel = require('./model')

async function create(userId, contactDTO) {
    const { dataValues: contactRecord } = await ContactModel.create({
        ...contactDTO,
        userId
    })

    return contactRecord
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
    findWhere,
    deleteWhere,
    updateWhere
}