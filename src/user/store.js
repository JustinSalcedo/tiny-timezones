const UserModel = require('./model')

async function create(userDTO) {
    const { dataValues: userRecord } = await UserModel.create(userDTO)
    return parseUserRecord(userRecord)
}

async function findWhere(condition, include) {
    const query = { where: condition }

    if (include) {
        query.include = include
    }
    
    const data = await UserModel.findOne(query)
    if (data) {
        const { dataValues: userRecord } = data
        return parseUserRecord(userRecord)
    }
}

function parseUserRecord(userDTO) {
    if (userDTO) {
        const parsedRecord = {...userDTO}

        if (userDTO.clocks && userDTO.clocks.length > 0) {
            parsedRecord.clocks = userDTO.clocks.map(clock => clock.dataValues)
        }

        if (userDTO.contacts && userDTO.contacts.length > 0) {
            parsedRecord.contacts = userDTO.contacts.map(contact => contact.dataValues)
        }

        if (userDTO.events && userDTO.events.length > 0) {
            parsedRecord.events = userDTO.events.map(event => event.dataValues)
        } 

        Reflect.deleteProperty(parsedRecord, 'openid_provider_sub')
        Reflect.deleteProperty(parsedRecord, 'openid_provider_exp')
    
        return parsedRecord
    }
}

module.exports = {
    create,
    findWhere
}