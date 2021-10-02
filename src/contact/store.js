const ContactModel = require('./model')

async function create(userId, contactDTO) {
    const { dataValues: contactRecord } = await ContactModel.create({
        ...contactDTO,
        userId
    })

    return contactRecord
}

module.exports = {
    create
}