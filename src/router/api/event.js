const express = require('express')
const route = express.Router()

const eventService = require('../../event/service')

function event(app) {
    app.use('/event', route)

    route.get(
        '/',
        async (req, res, next) => {
            try {
                const id = req.session.userId
                const eventRecords = await eventService.findByUserId(id)

                if (!eventRecords) {
                    return res.status(400).json({ error: 'Events could not be fetched' })
                }

                return res.status(200).json({ events: eventRecords })
            } catch (error) {
                console.log('Error in %s: %o', req.originalUrl, error)
                return next(error)
            }
        }
    )

    route.post(
        '/',
        async (req, res, next) => {
            try {
                const id = req.session.userId
                const { name, timezone, timestamp, reminder, contactIds, events } = req.body

                if (events) {
                    const eventRecords = await eventService.createManyEvents(id, events)
    
                    if (!eventRecords) {
                        return res.status(400).json({ error: 'Events could not be created' })
                    }
    
                    return res.status(201).json({ events: eventRecords })
                }
                
                const eventRecord = await eventService.createEvent(id, { name, timezone, timestamp, reminder, contactIds })

                if (!eventRecord) {
                    return res.status(400).json({ error: 'Event could not be created' })
                }

                return res.status(201).json(eventRecord)

            } catch (error) {
                console.log('Error in %s: %o', req.originalUrl, error)
                return next(error)
            }
        }
    )

    route.patch(
        '/:eventId',
        async (req, res, next) => {
            try {
                const { userId } = req.session
                const { eventId } = req.params
                
                if (Object.keys(req.body).length === 0) {
                    return res.status(400).json({ error: 'Event needs at least one field to be updated' })
                }

                const wasUpdated = await eventService.updateOneEvent(userId, eventId, req.body)

                if (!wasUpdated) {
                    return res.status(400).json({ error: 'Event could not be updated' })
                }

                return res.status(200).end()

            } catch (error) {
                console.log('Error in %s: %o', req.originalUrl, error)
                return next(error)
            }
        }
    )

    route.delete(
        '/:eventId',
        async (req, res, next) => {
            try {
                const { userId } = req.session
                const { eventId } = req.params

                await eventService.deleteOneEvent(userId, eventId)

                return res.status(200).end()

            } catch (error) {
                console.log('Error in %s: %o', req.originalUrl, error)
                return next(error)
            }
        }
    )
}

module.exports = event