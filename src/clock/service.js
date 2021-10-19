const store = require('./store')

const { validateTimezone } = require('../utils')

async function createClock(userId, clockData) {
    let { timezone, name } = clockData
    timezone = validateTimezone(timezone)

    const clockDTO = {
        name,
        timezone
    }

    return store.create(userId, clockDTO)
}

async function createManyClocks(userId, clocksData) {
    return store.createMany(userId, clocksData.map(clockData => {
        let { timezone, name } = clockData
        timezone = validateTimezone(timezone)
    
        return { timezone, name }
    }))
}

async function findByUserId(userId) {
    return store.findWhere({
        userId
    })
}

async function updateOneClock(userId, clockId, clockData) {
    const clockDTO = { ...clockData }

    if (clockDTO.timezone) {
        clockDTO.timezone = validateTimezone(clockDTO.timezone)
    }

    const [ nRows ] = await store.updateWhere(clockDTO, {
        userId,
        id: clockId
    })

    if (nRows === 1) {
        return true
    } else if (nRows === 0) {
        return false
    } else throw new Error('More than one record were updated')
}

async function deleteOneClock(userId, clockId) {
    return store.deleteWhere({
        userId,
        id: clockId
    })
}

module.exports = {
    createClock,
    createManyClocks,
    findByUserId,
    updateOneClock,
    deleteOneClock
}