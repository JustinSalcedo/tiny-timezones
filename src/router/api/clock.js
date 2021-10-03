const express = require('express')
const route = express.Router()

const clockService = require('../../clock/service')

function clock(app) {
    app.use('/clock', route)

    route.get(
        '/',
        async (req, res, next) => {
            try {
                const { id } = req.session
                const clockRecords = await clockService.findByUserId(id)

                if (!clockRecords) {
                    return res.status(400).json({ error: 'Clocks could not be fetched' })
                }

                return res.status(200).json({ clocks: clockRecords })
            } catch (error) {
                console.log('Error in %s: %o', req.path, error)
                return next(error)
            }
        }
    )

    route.post(
        '/',
        async (req, res, next) => {
            try {
                const { id } = req.session
                const { name, timezone } = req.body
                const clockRecord = await clockService.createClock(id, { name, timezone })

                if (!clockRecord) {
                    return res.status(400).json({ error: 'Clock could not be created' })
                }

                return res.status(201).json(clockRecord)

            } catch (error) {
                console.log('Error in %s: %o', req.path, error)
                return next(error)
            }
        }
    )

    route.patch(
        '/:clockId',
        async (req, res, next) => {
            try {
                const { id: userId } = req.session
                const { clockId } = req.params
                
                if (Object.keys(req.body).length === 0) {
                    return res.status(400).json({ error: 'Clock needs at least one field to be updated' })
                }

                const wasUpdated = await clockService.updateOneClock(userId, clockId, req.body)

                if (!wasUpdated) {
                    return res.status(400).json({ error: 'Clock could not be updated' })
                }

                return res.status(200).end()

            } catch (error) {
                console.log('Error in %s: %o', req.path, error)
                return next(error)
            }
        }
    )

    route.delete(
        '/:clockId',
        async (req, res, next) => {
            try {
                const { id: userId } = req.session
                const { clockId } = req.params

                await clockService.deleteOneClock(userId, clockId)

                return res.status(200).end()

            } catch (error) {
                console.log('Error in %s: %o', req.path, error)
                return next(error)
            }
        }
    )
}

module.exports = clock