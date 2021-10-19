const ClockModel = require('./model')

async function create(userId, clockDTO) {
    const { dataValues: clockRecord } = await ClockModel.create({
        ...clockDTO,
        userId
    })

    return clockRecord
}

async function createMany(userId, clockDTOs) {
    const parsedClockData = clockDTOs.map(clock => ({ ...clock, userId }))
    const clockRecords = await ClockModel.bulkCreate(parsedClockData, { validate: true })

    return clockRecords.map(record => record.dataValues)
}

async function findWhere(condition) {
    const clockRecords = await ClockModel.findAll({
        where: condition
    })

    return clockRecords.map(record => record.dataValues)
}

async function deleteWhere(condition) {
    return ClockModel.destroy({
        where: condition
    })
}

async function updateWhere(partialDTO, condition) {
    return ClockModel.update(partialDTO, {
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