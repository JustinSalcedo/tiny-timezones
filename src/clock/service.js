const store = require('./store')
const { policy } = require('../config')

const { validateTimezone } = require('../utils')

async function createClock(userId, clockData) {
    if (policy.user.clocksLimit) {
        const clocksCount = await store.countWhere({ userId })
        if (clocksCount === policy.user.clocksLimit) {
            throw new Error('Limit of clocks per user reached')
        }
    }

    let { timezone, name } = clockData
    timezone = validateTimezone(timezone)

    const clockDTO = {
        name,
        timezone
    }

    return store.create(userId, clockDTO)
}

async function createManyClocks(userId, clocksData) {
    let checkedClocksData = clocksData

    if (policy.user.clocksLimit) {
        const clocksCount = await store.countWhere({ userId })
        if (clocksData.length + clocksCount > policy.user.clocksLimit) {
            if (clocksCount === policy.user.clocksLimit) {
                throw new Error('Limit of clocks per user reached')
            }
            checkedClocksData = clocksData.slice(0, (policy.user.clocksLimit - clocksCount))
        }
    }

    return store.createMany(userId, checkedClocksData.map(clockData => {
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