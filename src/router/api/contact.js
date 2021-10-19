const express = require('express')
const route = express.Router()

const contactService = require('../../contact/service')

function contact(app) {
    app.use('/contact', route)

    route.get(
        '/',
        async (req, res, next) => {
            try {
                const id = req.session.userId
                const contactRecords = await contactService.findByUserId(id)

                if (!contactRecords) {
                    return res.status(400).json({ error: 'Contacts could not be fetched' })
                }

                return res.status(200).json({ contacts: contactRecords })
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
                const { name, timezone, contacts } = req.body

                if (contacts) {
                    const contactRecords = await contactService.createManyContacts(id, contacts)
    
                    if (!contactRecords) {
                        return res.status(400).json({ error: 'Contacts could not be created' })
                    }
    
                    return res.status(201).json({ contacts: contactRecords })
                }
                
                const contactRecord = await contactService.createContact(id, { name, timezone })

                if (!contactRecord) {
                    return res.status(400).json({ error: 'Contact could not be created' })
                }

                return res.status(201).json(contactRecord)

            } catch (error) {
                console.log('Error in %s: %o', req.originalUrl, error)
                return next(error)
            }
        }
    )

    route.patch(
        '/:contactId',
        async (req, res, next) => {
            try {
                const { userId } = req.session
                const { contactId } = req.params
                
                if (Object.keys(req.body).length === 0) {
                    return res.status(400).json({ error: 'Contact needs at least one field to be updated' })
                }

                const wasUpdated = await contactService.updateOneContact(userId, contactId, req.body)

                if (!wasUpdated) {
                    return res.status(400).json({ error: 'Contact could not be updated' })
                }

                return res.status(200).end()

            } catch (error) {
                console.log('Error in %s: %o', req.originalUrl, error)
                return next(error)
            }
        }
    )

    route.delete(
        '/:contactId',
        async (req, res, next) => {
            try {
                const { userId } = req.session
                const { contactId } = req.params

                await contactService.deleteOneContact(userId, contactId)

                return res.status(200).end()

            } catch (error) {
                console.log('Error in %s: %o', req.originalUrl, error)
                return next(error)
            }
        }
    )
}

module.exports = contact